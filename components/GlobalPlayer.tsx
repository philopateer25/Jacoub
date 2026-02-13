'use client';

import { usePlayer } from './PlayerProvider';
import { useEffect, useRef, useState } from 'react';

export default function GlobalPlayer() {
    const { currentTrack } = usePlayer();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (currentTrack && audioRef.current) {
            audioRef.current.src = currentTrack.fileUrl;
            // Seek to saved progress if available
            if (currentTrack.progress?.currentTime) {
                audioRef.current.currentTime = currentTrack.progress.currentTime;
            }
            audioRef.current.play();
        }
    }, [currentTrack]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
            // Debounce or periodic save could go here.
            // For simplicity, we save on pause or strict interval.
        }
    };

    const saveProgress = async () => {
        if (!currentTrack || !audioRef.current) return;

        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
            await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    audioTrackId: currentTrack.id,
                    progress: audioRef.current.currentTime,
                    completed: audioRef.current.ended
                })
            });
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    };

    // Save on pause and end
    const handlePause = () => saveProgress();

    const handleEnded = async () => {
        if (!currentTrack) return;
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
            await fetch('/api/progress/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, audioTrackId: currentTrack.id })
            });
            // Also update local progress
            saveProgress();
        } catch (e) {
            console.error("Failed to mark complete", e);
        }
    };

    // also save every 5 seconds if playing?
    useEffect(() => {
        const interval = setInterval(() => {
            if (audioRef.current && !audioRef.current.paused) {
                saveProgress();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [currentTrack]);


    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-2 md:p-4 shadow-2xl text-white z-50">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2 md:gap-4">
                <div className="w-full md:flex-1 text-center md:text-left truncate px-2">
                    <h3 className="font-bold text-base md:text-lg truncate">{currentTrack.title}</h3>
                    <p className="text-xs md:text-sm text-slate-400">Playing Now</p>
                </div>
                <audio
                    ref={audioRef}
                    controls
                    className="w-full md:max-w-md h-10 md:h-12"
                    onTimeUpdate={handleTimeUpdate}
                    onPause={handlePause}
                    onEnded={handleEnded}
                />
            </div>
        </div>
    );
}
