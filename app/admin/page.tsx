'use client';

import { useEffect, useState } from 'react';

interface VoiceMessage {
    id: string;
    fileUrl: string;
    createdAt: string;
    user: {
        email: string;
    };
    viewed: boolean;
    audioTrack?: {
        title: string;
        week?: {
            title: string;
            order: number;
        };
    };
}

export default function AdminDashboard() {
    const [messages, setMessages] = useState<VoiceMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});

    const toggleWeek = (weekKey: string) => {
        setExpandedWeeks(prev => ({
            ...prev,
            [weekKey]: !prev[weekKey]
        }));
    };

    const markAsViewed = async (message: VoiceMessage) => {
        if (message.viewed) return;

        // Optimistic update
        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, viewed: true } : m));

        try {
            await fetch(`/api/messages/${message.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ viewed: true })
            });
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetch('/api/messages')
            .then(res => res.json())
            .then(data => {
                setMessages(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            const res = await fetch(`/api/messages/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMessages(prev => prev.filter(msg => msg.id !== id));
            } else {
                alert('Failed to delete message');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting message');
        }
    };

    const handleBatchDelete = async (ids: string[]) => {
        if (!confirm(`Are you sure you want to delete all ${ids.length} messages in this week?`)) return;

        try {
            const res = await fetch('/api/messages/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
            });

            if (res.ok) {
                setMessages(prev => prev.filter(msg => !ids.includes(msg.id)));
                alert('Batch delete successful');
            } else {
                alert('Batch delete failed');
            }
        } catch (e) {
            console.error(e);
            alert('Error performing batch delete');
        }
    };

    // Group messages by Week
    const groupedMessages = messages.reduce((acc, msg) => {
        const weekKey = msg.audioTrack?.week
            ? `Week ${msg.audioTrack.week.order}: ${msg.audioTrack.week.title}`
            : 'Uncategorized';

        if (!acc[weekKey]) acc[weekKey] = [];
        acc[weekKey].push(msg);
        return acc;
    }, {} as Record<string, VoiceMessage[]>);

    // Sort weeks (Uncategorized last, then by order if possible, or string sort)
    const sortedWeekKeys = Object.keys(groupedMessages).sort((a, b) => {
        if (a === 'Uncategorized') return 1;
        if (b === 'Uncategorized') return -1;
        return a.localeCompare(b);
    });

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-slate-400 text-sm font-medium">Total Messages</h3>
                    <p className="text-3xl font-bold text-white mt-2">{messages.length}</p>
                </div>
            </div>

            <section className="space-y-8">
                <h2 className="text-2xl font-bold border-b border-slate-700 pb-4">Voice Inbox</h2>

                {loading ? (
                    <div className="p-6">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="p-6 text-slate-500">No messages yet.</div>
                ) : (
                    <div className="space-y-8">
                        {sortedWeekKeys.map(weekKey => {
                            const weekMessages = groupedMessages[weekKey];
                            const isExpanded = expandedWeeks[weekKey] !== false; // Default true
                            const unreadInWeek = weekMessages.filter(m => !m.viewed).length;

                            return (
                                <div key={weekKey} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                                    <div
                                        className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-850 transition-colors"
                                        onClick={() => toggleWeek(weekKey)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-400 font-mono">{isExpanded ? '▼' : '▶'}</span>
                                            <h3 className="font-bold text-lg text-blue-400">{weekKey}</h3>
                                            {unreadInWeek > 0 && <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full text-white">{unreadInWeek} new</span>}
                                        </div>
                                        <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                                            <span className="text-sm text-slate-400">{weekMessages.length} messages</span>
                                            <button
                                                onClick={() => handleBatchDelete(weekMessages.map(m => m.id))}
                                                className="bg-red-900/50 hover:bg-red-900 text-red-200 px-3 py-1 rounded text-xs font-bold transition-colors border border-red-800"
                                            >
                                                Delete All in Week
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="divide-y divide-slate-700">
                                            {weekMessages.map((msg) => (
                                                <div key={msg.id} className={`p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${msg.viewed ? 'bg-slate-800' : 'bg-slate-800/80 border-l-4 border-l-blue-500'}`}>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className={`text-lg ${msg.viewed ? 'font-normal text-slate-300' : 'font-bold text-white'}`}>{msg.user.email}</h4>
                                                            {!msg.viewed && <span className="text-xs bg-blue-500 text-white px-1.5 rounded">NEW</span>}
                                                        </div>
                                                        <div className="text-sm text-slate-400 mt-1">
                                                            {new Date(msg.createdAt).toLocaleString()}
                                                        </div>
                                                        {msg.audioTrack && (
                                                            <div className="text-xs text-slate-500 mt-1 bg-slate-900/50 inline-block px-2 py-1 rounded">
                                                                Re: {msg.audioTrack.title}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                                        <audio
                                                            controls
                                                            src={msg.fileUrl}
                                                            className="h-10 w-full md:w-64"
                                                            onPlay={() => markAsViewed(msg)}
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <a
                                                                href={msg.fileUrl}
                                                                download={`voice-message-${msg.id}.webm`}
                                                                className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded text-sm font-bold text-center transition-colors flex-1"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                Download
                                                            </a>
                                                            <button
                                                                onClick={() => handleDelete(msg.id)}
                                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-bold transition-colors flex-1"
                                                            >
                                                                Delete
                                                            </button>
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
