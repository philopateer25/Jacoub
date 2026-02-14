'use client';

import { useEffect, useState } from 'react';

interface Answer {
    id: string;
    text: string;
    createdAt: string;
    user: {
        email: string; // This is actually the username now
    };
    question: {
        text: string;
        week?: {
            title: string;
            order: number;
        };
    };
}

export default function AnswersPage() {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetch('/api/answers')
            .then(res => res.json())
            .then(data => {
                setAnswers(data);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    const handleBatchDelete = async (ids: string[]) => {
        if (!confirm(`Are you sure you want to delete all ${ids.length} answers in this week?`)) return;

        try {
            const res = await fetch('/api/answers/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
            });

            if (res.ok) {
                setAnswers(prev => prev.filter(a => !ids.includes(a.id)));
                alert('Batch delete successful');
            } else {
                alert('Batch delete failed');
            }
        } catch (e) {
            console.error(e);
            alert('Error performing batch delete');
        }
    };

    const toggleWeek = (weekKey: string) => {
        setExpandedWeeks(prev => ({
            ...prev,
            [weekKey]: !prev[weekKey]
        }));
    };

    // Group answers by Week
    const groupedAnswers = answers.reduce((acc, answer) => {
        const weekKey = answer.question.week
            ? `Week ${answer.question.week.order}: ${answer.question.week.title}`
            : 'Uncategorized';

        if (!acc[weekKey]) acc[weekKey] = [];
        acc[weekKey].push(answer);
        return acc;
    }, {} as Record<string, Answer[]>);

    const sortedWeekKeys = Object.keys(groupedAnswers).sort((a, b) => {
        if (a === 'Uncategorized') return 1;
        if (b === 'Uncategorized') return -1;
        return a.localeCompare(b);
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">User Answers Review</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-slate-400 text-sm font-medium">Total Answers</h3>
                    <p className="text-3xl font-bold text-white mt-2">{answers.length}</p>
                </div>
            </div>

            <section className="space-y-8">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Loading answers...</div>
                ) : answers.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">No answers submitted yet.</div>
                ) : (
                    <div className="space-y-8">
                        {sortedWeekKeys.map(weekKey => {
                            const weekAnswers = groupedAnswers[weekKey];
                            const isExpanded = expandedWeeks[weekKey] !== false; // Default true

                            return (
                                <div key={weekKey} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                                    <div
                                        className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-850 transition-colors"
                                        onClick={() => toggleWeek(weekKey)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-400 font-mono">{isExpanded ? '▼' : '▶'}</span>
                                            <h3 className="font-bold text-lg text-blue-400">{weekKey}</h3>
                                        </div>
                                        <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                                            <span className="text-sm text-slate-400">{weekAnswers.length} answers</span>
                                            <button
                                                onClick={() => handleBatchDelete(weekAnswers.map(a => a.id))}
                                                className="bg-red-900/50 hover:bg-red-900 text-red-200 px-3 py-1 rounded text-xs font-bold transition-colors border border-red-800"
                                            >
                                                Delete All in Week
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="divide-y divide-slate-700">
                                            {weekAnswers.map(answer => (
                                                <div key={answer.id} className="p-6 hover:bg-slate-700/30 transition-colors">
                                                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                                                        <div className="mb-2 md:mb-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-blue-400 font-mono text-sm">{answer.user.email}</span>
                                                                <span className="text-slate-500 text-xs">• {new Date(answer.createdAt).toLocaleString()}</span>
                                                            </div>
                                                            <div className="text-sm text-slate-400 font-medium mb-2">
                                                                Q: {answer.question.text}
                                                            </div>
                                                            <div className="text-white bg-slate-700/50 p-3 rounded text-sm whitespace-pre-wrap">
                                                                {answer.text}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
