'use client';

import { useState, useEffect } from 'react';

interface Week {
    id: string;
    title: string;
    order: number;
}

export default function UploadPage() {
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [selectedWeek, setSelectedWeek] = useState('');
    const [uploadType, setUploadType] = useState<'TRACK' | 'QUESTION'>('TRACK');

    // Track State
    const [trackSource, setTrackSource] = useState<'AUDIO' | 'YOUTUBE'>('AUDIO');
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');


    // Question State
    const [questionText, setQuestionText] = useState('');

    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetch('/api/weeks')
            .then(res => res.json())
            .then(setWeeks)
            .catch(console.error);
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWeek) return alert('Please select a week');

        setIsUploading(true);

        try {
            if (uploadType === 'TRACK') {
                if (!title) return alert('Title is required');

                let finalUrl = '';

                // 1. Upload File if AUDIO
                if (trackSource === 'AUDIO') {
                    if (!file) return alert('File required for audio');

                    // Client-side upload to Vercel Blob
                    const { upload } = await import('@vercel/blob/client');

                    const newBlob = await upload(file.name, file, {
                        access: 'public',
                        handleUploadUrl: '/api/upload/token',
                        addRandomSuffix: true, // Fix: Prevent conflict if file exists
                    });

                    finalUrl = newBlob.url;
                } else {
                    if (!url) return alert('URL required for YouTube');
                    finalUrl = url;
                }

                // 2. Save Metadata to DB
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        weekId: selectedWeek,
                        type: trackSource, // AUDIO or YOUTUBE
                        url: finalUrl
                    }),
                });

                if (res.ok) {
                    alert('Track uploaded successfully!');
                    setTitle('');
                    setFile(null);
                    setUrl('');
                } else {
                    alert('Upload failed');
                }
            } else {
                // Bulk Question Upload
                if (!questionText) return alert('Question text required');

                // Split by newline and filter empty
                const questions = questionText.split('\n').map(q => q.trim()).filter(q => q);

                if (questions.length === 0) return alert('No valid questions found');

                const res = await fetch('/api/questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        weekId: selectedWeek,
                        text: questions
                    }),
                });

                if (res.ok) {
                    alert(`${questions.length} Question(s) added successfully!`);
                    setQuestionText('');
                } else {
                    alert('Failed to add questions');
                }
            }
        } catch (error) {
            console.error(error);
            alert('Error occurred: ' + (error as Error).message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-8">Upload Content</h1>

            <form onSubmit={handleUpload} className="space-y-6 bg-slate-800 p-8 rounded-lg border border-slate-700">

                {/* Week Selection */}
                <div>
                    <label className="block text-slate-300 mb-2">Select Week</label>
                    <select
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 outline-none"
                        required
                    >
                        <option value="">-- Choose a week --</option>
                        {weeks.map(w => (
                            <option key={w.id} value={w.id}>Week {w.order}: {w.title}</option>
                        ))}
                    </select>
                </div>

                {/* Type Selection */}
                <div>
                    <label className="block text-slate-300 mb-2">Content Type</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                checked={uploadType === 'TRACK'}
                                onChange={() => setUploadType('TRACK')}
                                className="w-4 h-4 text-blue-500"
                            />
                            <span>Audio Track</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                checked={uploadType === 'QUESTION'}
                                onChange={() => setUploadType('QUESTION')}
                                className="w-4 h-4 text-blue-500"
                            />
                            <span>Question(s)</span>
                        </label>
                    </div>
                </div>

                {uploadType === 'TRACK' ? (
                    <div className="space-y-6">
                        {/* content type selector within TRACK */}
                        <div>
                            <label className="block text-slate-300 mb-2">Track Source</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-700 px-4 py-2 rounded">
                                    <input
                                        type="radio"
                                        name="trackSource"
                                        checked={trackSource === 'AUDIO'}
                                        onChange={() => setTrackSource('AUDIO')}
                                        className="w-4 h-4 text-blue-500"
                                    />
                                    <span>Upload Audio File</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-700 px-4 py-2 rounded">
                                    <input
                                        type="radio"
                                        name="trackSource"
                                        checked={trackSource === 'YOUTUBE'}
                                        onChange={() => setTrackSource('YOUTUBE')}
                                        className="w-4 h-4 text-blue-500"
                                    />
                                    <span>YouTube URL</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-300 mb-2">Track Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 outline-none"
                                placeholder="e.g. Lesson 1"
                            />
                        </div>

                        {trackSource === 'AUDIO' ? (
                            <div>
                                <label className="block text-slate-300 mb-2">Audio File</label>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 outline-none"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-slate-300 mb-2">YouTube URL</label>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 outline-none"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <label className="block text-slate-300 mb-2">Question Text</label>
                        <textarea
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 outline-none min-h-[150px]"
                            placeholder="Enter the question text here...&#10;To add multiple questions, put each one on a new line."
                        />
                        <p className="text-xs text-slate-500 mt-2">Tip: Each line will be created as a separate question.</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
                >
                    {isUploading ? 'Uploading...' : 'Add Content'}
                </button>
            </form>
        </div>
    );
}
