'use client';

import { useState, useEffect } from 'react';
import { usePlayer } from '@/components/PlayerProvider';
import VoiceRecorder from '@/components/VoiceRecorder';
import { useRouter } from 'next/navigation';

interface ContentItem {
    id: string;
    type: 'TRACK' | 'QUESTION';
    title?: string;      // For tracks
    fileUrl?: string;    // For tracks
    text?: string;       // For questions
    order: number;
}

interface Week {
    id: string;
    title: string;
    order: number;
    content: ContentItem[];
}

export default function UserDashboard() {
    const { playTrack, currentTrack } = usePlayer();
    const router = useRouter();
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    // Q&A State
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
    const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
    const [progressMap, setProgressMap] = useState<Record<string, any>>({});

    useEffect(() => {
        // Auth Check
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/');
            return;
        }
        const userData = JSON.parse(userStr);
        setUser(userData);

        // 1. Fetch Weeks (now returns mixed content)
        fetch('/api/weeks')
            .then((res) => res.json())
            .then((data) => {
                setWeeks(data);
                if (data.length > 0) setExpandedWeekId(data[0].id);
            })
            .catch((err) => console.error(err));

        // 2. Fetch Progress (Track progress)
        fetch(`/api/tracks?userId=${userData.id}`)
            .then(res => res.json())
            .then(tracks => {
                const map: Record<string, any> = {};
                tracks.forEach((t: any) => {
                    if (t.progress) map[t.id] = t.progress;
                });
                setProgressMap(map);
            })
            .catch(console.error)
            .finally(() => setLoading(false));

        // 3. Fetch Existing Answers
        fetch(`/api/users/answers?userId=${userData.id}`)
            .then(res => res.json())
            .then((savedAnswers: any[]) => {
                const submittedMap: Record<string, boolean> = {};
                const textMap: Record<string, string> = {};
                savedAnswers.forEach(ans => {
                    submittedMap[ans.questionId] = true;
                    textMap[ans.questionId] = ans.text;
                });
                setSubmitted(prev => ({ ...prev, ...submittedMap }));
                setAnswers(prev => ({ ...prev, ...textMap }));
            })
            .catch(console.error);

    }, [router]);

    const toggleWeek = (id: string) => {
        setExpandedWeekId(expandedWeekId === id ? null : id);
    };

    const handleAnswerChange = (questionId: string, text: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: text }));
    };

    const submitAnswer = async (questionId: string) => {
        if (!user) return alert('Please log in');
        const text = answers[questionId];
        if (!text) return;

        setSubmitting(prev => ({ ...prev, [questionId]: true }));
        try {
            const res = await fetch('/api/answers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, questionId, text })
            });

            if (res.ok) {
                setSubmitted(prev => ({ ...prev, [questionId]: true }));
            } else {
                alert('Failed. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert('Error submitting answer');
        } finally {
            setSubmitting(prev => ({ ...prev, [questionId]: false }));
        }
    };

    return (
        <div className="p-8 pb-32 max-w-5xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-8">Jacoub Learning Path</h1>

            <div className="space-y-4">
                {loading ? <p>Loading content...</p> : weeks.map(week => (
                    <div key={week.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        <button
                            onClick={() => toggleWeek(week.id)}
                            className="w-full text-left p-6 flex justify-between items-center bg-slate-800 hover:bg-slate-750"
                        >
                            <div>
                                <h2 className="text-xl font-bold text-blue-400">Week {week.order}: {week.title}</h2>
                                <p className="text-slate-400 text-sm">{week.content?.length || 0} Items</p>
                            </div>
                            <span className="text-2xl">{expandedWeekId === week.id ? '−' : '+'}</span>
                        </button>

                        {expandedWeekId === week.id && (
                            <div className="p-6 pt-0 border-t border-slate-700 bg-slate-900/50">
                                <div className="space-y-6 mt-6">
                                    {(!week.content || week.content.length === 0) && <p className="text-slate-500 text-sm">No content yet.</p>}

                                    {week.content?.map((item) => {
                                        if (item.type === 'TRACK') {
                                            const progress = progressMap[item.id];
                                            const isCompleted = progress?.completed;
                                            const isPlaying = currentTrack?.id === item.id;

                                            return (
                                                <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                                                    {/* Track Header */}
                                                    <div
                                                        onClick={() => playTrack({
                                                            id: item.id,
                                                            title: item.title || 'Unknown Track',
                                                            fileUrl: item.fileUrl || ''
                                                        })}
                                                        className="cursor-pointer flex items-center justify-between mb-4"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPlaying ? 'bg-green-500' : 'bg-blue-600'}`}>
                                                                {isPlaying ? '⏸' : '▶'}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-lg">{item.title}</div>
                                                                {progress && (
                                                                    <div className="text-xs text-slate-400">
                                                                        {isCompleted ? <span className="text-green-400">Completed</span> : <span>{Math.round(progress.currentTime)}s listened</span>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {isCompleted && <span className="text-green-500 text-xl font-bold">✓</span>}
                                                    </div>

                                                    {/* Voice Recorder (Contextual) */}
                                                    {isPlaying && (
                                                        <div className="mt-4 pt-4 border-t border-slate-700 animate-fadeIn bg-slate-700/30 p-4 rounded">
                                                            <h4 className="font-bold text-sm mb-3">Ask a Question / Send Voice Note</h4>
                                                            <p className="text-xs text-slate-400 mb-2">Recording for: {item.title}</p>
                                                            <VoiceRecorder trackId={item.id} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        } else if (item.type === 'QUESTION') {
                                            return (
                                                <div key={item.id} className="bg-slate-800 border border-blue-900/50 rounded-lg p-6 hover:border-blue-700 transition-colors">
                                                    <div className="flex gap-4">
                                                        <div className="text-blue-400 font-bold text-xl">?</div>
                                                        <div className="flex-1 space-y-3">
                                                            <p className="text-lg font-medium text-slate-200">{item.text}</p>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    disabled={submitted[item.id]}
                                                                    value={answers[item.id] || ''}
                                                                    onChange={e => handleAnswerChange(item.id, e.target.value)}
                                                                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-4 py-2 text-sm focus:border-blue-500 outline-none"
                                                                    placeholder="Type your answer here..."
                                                                />
                                                                {!submitted[item.id] ? (
                                                                    <button
                                                                        onClick={() => submitAnswer(item.id)}
                                                                        disabled={submitting[item.id]}
                                                                        className="bg-blue-600 px-6 py-2 rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                                                                    >
                                                                        {submitting[item.id] ? '...' : 'Submit'}
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-green-400 text-sm font-bold self-center px-4">✓ Answered</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {weeks.length === 0 && !loading && (
                <div className="text-center p-8 text-slate-500">
                    No content available.
                </div>
            )}
        </div>
    );
}
