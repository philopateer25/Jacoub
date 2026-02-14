'use client';

import { useEffect, useState } from 'react';

interface VoiceMessage {
    id: string;
    fileUrl: string;
    createdAt: string;
    user: {
        email: string;
    };
    audioTrack?: {
        title: string;
    };
}

export default function AdminDashboard() {
    const [messages, setMessages] = useState<VoiceMessage[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-slate-400 text-sm font-medium">New Messages</h3>
                    <p className="text-3xl font-bold text-white mt-2">{messages.length}</p>
                </div>
            </div>

            <section className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold">Voice Inbox</h2>
                </div>

                {loading ? (
                    <div className="p-6">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="p-6 text-slate-500">No messages yet.</div>
                ) : (
                    <div className="divide-y divide-slate-700">
                        {messages.map((msg) => (
                            <div key={msg.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-700/50 transition-colors">
                                <div>
                                    <h4 className="font-bold text-lg text-blue-400">{msg.user.email}</h4>
                                    <div className="text-sm text-slate-400 mt-1">
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </div>
                                    {msg.audioTrack && (
                                        <div className="text-xs text-slate-500 mt-1 bg-slate-900/50 inline-block px-2 py-1 rounded">
                                            Re: {msg.audioTrack.title}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <audio controls src={msg.fileUrl} className="h-10 w-full md:w-64" />
                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-bold transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
