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
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');

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
                if (!file || !title) return alert('File and title required');

                const formData = new FormData();
                formData.append('file', file);
                formData.append('title', title);
                formData.append('weekId', selectedWeek);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    alert('Track uploaded successfully!');
                    setTitle('');
                    setFile(null);
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
                        text: questions // API handles array 
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
            alert('Error occurred');
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
                    <>
                        <div>
                            <label className="block text-slate-300 mb-2">Track Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 outline-none"
                                placeholder="e.g. Lesson 1 Audio"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-300 mb-2">Audio File</label>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </>
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
