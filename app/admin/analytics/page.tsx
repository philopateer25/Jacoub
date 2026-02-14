'use client';

import { useState, useEffect } from 'react';

interface Track {
    id: string;
    title: string;
    type: 'AUDIO' | 'YOUTUBE';
    week?: {
        title: string;
        course: { title: string };
    };
}

interface UserProgress {
    userId: string;
    email: string;
    progress: number;
    completed: boolean;
    listenCount: number;
    lastListenedAt: string;
}

export default function AnalyticsPage() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedTrackId, setSelectedTrackId] = useState('');
    const [stats, setStats] = useState<UserProgress[]>([]);
    const [loadingTracks, setLoadingTracks] = useState(true);
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        fetch('/api/tracks')
            .then(res => res.json())
            .then(data => {
                // Filter out YouTube tracks as we can't track them
                const audioOnly = (data as Track[]).filter(t => t.type !== 'YOUTUBE');
                setTracks(audioOnly);
                setLoadingTracks(false);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedTrackId) {
            setStats([]);
            return;
        }

        setLoadingStats(true);
        fetch(`/api/analytics/track/${selectedTrackId}`)
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoadingStats(false);
            })
            .catch(console.error);
    }, [selectedTrackId]);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">User Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Track Selector */}
                <div className="bg-slate-800 p-6 rounded-lg h-fit border border-slate-700">
                    <h2 className="text-xl font-bold mb-4">Select Audio Track</h2>
                    {loadingTracks ? (
                        <p>Loading tracks...</p>
                    ) : (
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                            {tracks.map(track => (
                                <button
                                    key={track.id}
                                    onClick={() => setSelectedTrackId(track.id)}
                                    className={`w-full text-left p-3 rounded transition-colors ${selectedTrackId === track.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                >
                                    <div className="font-semibold">{track.title}</div>
                                    <div className="text-xs opacity-70">
                                        {track.week ? `${track.week.course.title} - ${track.week.title}` : 'Uncategorized'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats Table */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 min-h-[400px]">
                        <h2 className="text-xl font-bold mb-6">
                            {selectedTrackId ? 'Listening Activity' : 'Select a track to view stats'}
                        </h2>

                        {loadingStats ? (
                            <p>Loading stats...</p>
                        ) : !selectedTrackId ? (
                            <div className="flex items-center justify-center h-40 text-slate-500">
                                ← Choose a track from the list
                            </div>
                        ) : stats.length === 0 ? (
                            <p className="text-slate-400">No listening activity recorded for this track yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-700 text-slate-400 text-sm">
                                            <th className="p-3">User</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Times Started</th>
                                            <th className="p-3">Last Active</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.map((stat, idx) => (
                                            <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                                <td className="p-3 font-medium">{stat.email}</td>
                                                <td className="p-3">
                                                    {stat.completed ? (
                                                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Completed</span>
                                                    ) : (
                                                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">In Progress ({Math.round(stat.progress)}s)</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center">{stat.listenCount}</td>
                                                <td className="p-3 text-sm text-slate-400">
                                                    {new Date(stat.lastListenedAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
