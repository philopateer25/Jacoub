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

    useEffect(() => {
        fetch('/api/answers')
            .then(res => res.json())
            .then(data => {
                setAnswers(data);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">User Answers Review</h1>

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-xl">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Loading answers...</div>
                ) : answers.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">No answers submitted yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-700/50 text-slate-300 border-b border-slate-700">
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">User</th>
                                    <th className="p-4 font-semibold">Context</th>
                                    <th className="p-4 font-semibold">Question & Answer</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {answers.map(answer => (
                                    <tr key={answer.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 text-sm text-slate-400 align-top whitespace-nowrap">
                                            {new Date(answer.createdAt).toLocaleDateString()}
                                            <div className="text-xs opacity-70">
                                                {new Date(answer.createdAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-blue-400 align-top font-mono text-sm">
                                            {answer.user.email}
                                        </td>
                                        <td className="p-4 text-slate-300 align-top text-sm">
                                            {answer.question.week ? (
                                                <span className="bg-slate-900 px-2 py-1 rounded text-xs border border-slate-700">
                                                    Week {answer.question.week.order}: {answer.question.week.title}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500 italic">No Context</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="mb-2 text-sm text-slate-400 font-medium border-l-2 border-slate-600 pl-2">
                                                Q: {answer.question.text}
                                            </div>
                                            <div className="text-white bg-slate-700/50 p-3 rounded text-sm">
                                                {answer.text}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
