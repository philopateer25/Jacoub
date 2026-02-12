'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Week {
    id: string;
    title: string;
    order: number;
    content?: any[]; // Mixed content
    tracks?: any[];
}

export default function WeeksPage() {
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [loading, setLoading] = useState(true);

    // Create State
    const [title, setTitle] = useState('');
    const [order, setOrder] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Edit State (Week)
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editOrder, setEditOrder] = useState('');

    // Content Management State
    const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editItemText, setEditItemText] = useState('');

    const fetchWeeks = () => {
        fetch('/api/weeks')
            .then((res) => res.json())
            .then((data) => {
                setWeeks(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchWeeks();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await fetch('/api/weeks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, order: parseInt(order) }),
            });
            if (res.ok) {
                setTitle('');
                setOrder('');
                fetchWeeks();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this week and all its content?')) return;
        try {
            const res = await fetch(`/api/weeks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchWeeks();
            } else {
                alert('Failed to delete');
            }
        } catch (e) { console.error(e); }
    };

    const startEdit = (week: Week) => {
        setEditingId(week.id);
        setEditTitle(week.title);
        setEditOrder(week.order.toString());
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle('');
        setEditOrder('');
    };

    const saveEdit = async (id: string) => {
        try {
            const res = await fetch(`/api/weeks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editTitle, order: parseInt(editOrder) }),
            });
            if (res.ok) {
                setEditingId(null);
                fetchWeeks();
            } else {
                alert('Failed to update');
            }
        } catch (e) { console.error(e); }
    };

    // --- Content Item Handlers ---

    const toggleWeek = (id: string) => {
        setExpandedWeekId(expandedWeekId === id ? null : id);
    };

    const handleDeleteItem = async (type: 'TRACK' | 'QUESTION', id: string) => {
        if (!confirm('Delete this item?')) return;
        const endpoint = type === 'TRACK' ? `/api/tracks/${id}` : `/api/questions/${id}`;

        try {
            const res = await fetch(endpoint, { method: 'DELETE' });
            if (res.ok) fetchWeeks();
            else alert('Failed to delete');
        } catch (e) { console.error(e); }
    };

    const startEditItem = (item: any) => {
        setEditingItemId(item.id);
        setEditItemText(item.title || item.text); // Title for track, Text for question
    };

    const saveEditItem = async (type: 'TRACK' | 'QUESTION', id: string) => {
        const endpoint = type === 'TRACK' ? `/api/tracks/${id}` : `/api/questions/${id}`;
        const body = type === 'TRACK' ? { title: editItemText } : { text: editItemText };

        try {
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setEditingItemId(null);
                fetchWeeks();
            } else {
                alert('Failed to update');
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-8">Week Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="bg-slate-800 p-6 rounded-lg h-fit">
                    <h2 className="text-xl font-bold mb-4">Create New Week</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Week Title</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-blue-500 outline-none text-white"
                                placeholder="e.g. Introduction"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Order</label>
                            <input
                                type="number"
                                value={order}
                                onChange={e => setOrder(e.target.value)}
                                className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-blue-500 outline-none text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            {isCreating ? 'Creating...' : 'Create Week'}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <p>Loading weeks...</p>
                    ) : weeks.length === 0 ? (
                        <p className="text-gray-500">No weeks found. Create one to get started.</p>
                    ) : (
                        weeks.map(week => (
                            <div key={week.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                                {/* Week Header */}
                                <div className="p-4 flex items-center justify-between bg-slate-800">
                                    {editingId === week.id ? (
                                        <div className="flex gap-2 flex-1 items-center">
                                            <input
                                                value={editTitle}
                                                onChange={e => setEditTitle(e.target.value)}
                                                className="flex-1 p-2 rounded bg-slate-900 border border-blue-500 outline-none text-white"
                                            />
                                            <input
                                                type="number"
                                                value={editOrder}
                                                onChange={e => setEditOrder(e.target.value)}
                                                className="w-16 p-2 rounded bg-slate-900 border border-blue-500 outline-none text-white"
                                            />
                                            <button onClick={() => saveEdit(week.id)} className="text-green-400 hover:text-green-300">Save</button>
                                            <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-200">Cancel</button>
                                        </div>
                                    ) : (
                                        <>
                                            <div
                                                className="cursor-pointer flex-1 flex items-center"
                                                onClick={() => toggleWeek(week.id)}
                                            >
                                                <span className="bg-slate-900 text-slate-300 px-2 py-1 rounded text-sm mr-3 font-mono">
                                                    #{week.order}
                                                </span>
                                                <span className="font-bold text-lg text-blue-400">{week.title}</span>
                                                <span className="ml-4 text-xs text-slate-500">
                                                    {week.content ? week.content.length : (week.tracks?.length || 0)} Items
                                                </span>
                                                <span className="ml-auto mr-4 text-slate-500">
                                                    {expandedWeekId === week.id ? '▼' : '▶'}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => startEdit(week)} className="p-2 text-blue-400 hover:bg-slate-700 rounded">✏️</button>
                                                <button onClick={() => handleDelete(week.id)} className="p-2 text-red-400 hover:bg-slate-700 rounded">🗑️</button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Content List (Expandable) */}
                                {expandedWeekId === week.id && (
                                    <div className="bg-slate-900/50 p-4 border-t border-slate-700 space-y-2">
                                        {!week.content?.length && <p className="text-slate-500 text-sm">No content.</p>}
                                        {week.content?.map((item: any) => (
                                            <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-800 rounded group">
                                                {editingItemId === item.id ? (
                                                    <div className="flex gap-2 flex-1 items-center">
                                                        <input
                                                            value={editItemText}
                                                            onChange={e => setEditItemText(e.target.value)}
                                                            className="flex-1 p-1 rounded bg-slate-700 border border-blue-500 outline-none text-white text-sm"
                                                        />
                                                        <button onClick={() => saveEditItem(item.type, item.id)} className="text-green-400 text-sm hover:underline">Save</button>
                                                        <button onClick={() => setEditingItemId(null)} className="text-slate-400 text-sm hover:underline">Cancel</button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-3 text-sm text-slate-300">
                                                            <span className="text-xs font-mono text-slate-500 w-6">#{item.order}</span>
                                                            {item.type === 'TRACK' ? (
                                                                <span className="flex items-center gap-2">
                                                                    🎵 {item.title}
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-2 text-yellow-500/80">
                                                                    ❓ {item.text.substring(0, 50)}{item.text.length > 50 && '...'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => startEditItem(item)} className="text-blue-400 hover:text-blue-300 text-xs">Edit</button>
                                                            <button onClick={() => handleDeleteItem(item.type, item.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
