// @ts-nocheck
'use client';

import { usePlayer } from './PlayerProvider';
import { useEffect, useRef, useState } from 'react';

export default function GlobalPlayer() {
    const { currentTrack } = usePlayer();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    // When track changes, reset and play
    useEffect(() => {
        setIsPlaying(true);
        if (audioRef.current && currentTrack) {
            audioRef.current.play().catch(e => console.error("Play failed", e));
        }
    }, [currentTrack]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
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
                    completed: false
                })
            });
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    };

    const handlePause = () => {
        saveProgress();
        setIsPlaying(false);
    };

    const handlePlay = () => {
        setIsPlaying(true);
    };

    const handleEnded = async () => {
        if (!currentTrack) return;
        setIsPlaying(false);
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
            await fetch('/api/progress/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, audioTrackId: currentTrack.id })
            });
            saveProgress();
        } catch (e) {
            console.error("Failed to mark complete", e);
        }
    };

    // Auto-save interval
    useEffect(() => {
        const interval = setInterval(() => {
            if (isPlaying && currentTrack) {
                saveProgress();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [currentTrack, isPlaying]);

    // Seek on load
    const handleLoadedMetadata = () => {
        if (currentTrack?.progress?.currentTime && audioRef.current) {
            audioRef.current.currentTime = currentTrack.progress.currentTime;
        }
        if (isPlaying && audioRef.current) {
            audioRef.current.play().catch(console.error);
        }
    };

    if (!currentTrack) return null;

    // Safety check: If it's a YouTube track, we shouldn't be playing it here anymore.
    // But if one slips through, we just render null.
    if (currentTrack.type === 'YOUTUBE') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 shadow-2xl text-white z-50 p-2 md:p-4 transition-all duration-300">
            <div className="mx-auto flex flex-col md:flex-row items-center gap-2 md:gap-4 max-w-6xl">

                {/* Track Info */}
                <div className="w-full md:flex-1 text-center md:text-left truncate px-2">
                    <h3 className="font-bold text-base md:text-lg truncate">{currentTrack.title}</h3>
                    <p className="text-xs md:text-sm text-slate-400">
                        Playing Audio
                    </p>
                </div>

                {/* Player Container */}
                <div className="w-full md:max-w-md">
                    <audio
                        ref={audioRef}
                        src={currentTrack.fileUrl}
                        controls
                        className="w-full h-10 md:h-12 block"
                        onTimeUpdate={handleTimeUpdate}
                        onPause={handlePause}
                        onPlay={handlePlay}
                        onEnded={handleEnded}
                        onLoadedMetadata={handleLoadedMetadata}
                        autoPlay
                    />
                </div>
            </div>
        </div>
    );
}
