'use client';

import { usePlayer } from './PlayerProvider';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';

export default function GlobalPlayer() {
    const { currentTrack } = usePlayer();
    const playerRef = useRef<any>(null);
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    // When track changes, reset and play
    useEffect(() => {
        setIsPlaying(true);
    }, [currentTrack]);

    const handleProgress = (state: { playedSeconds: number }) => {
        setProgress(state.playedSeconds);
        // Save progress logic could be debounced here
    };

    const saveProgress = async () => {
        if (!currentTrack || !playerRef.current) return;

        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
            await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    audioTrackId: currentTrack.id,
                    progress: playerRef.current.getCurrentTime(),
                    completed: false // We mark completed onEnded
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
    const handleReady = () => {
        if (currentTrack?.progress?.currentTime && playerRef.current) {
            playerRef.current.seekTo(currentTrack.progress.currentTime);
        }
    };

    if (!currentTrack) return null;

    const isYouTube = currentTrack.type === 'YOUTUBE';

    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 shadow-2xl text-white z-50 transition-all duration-300 ${isYouTube ? 'h-auto p-0 md:p-4' : 'p-2 md:p-4'}`}>
            <div className={`mx-auto flex ${isYouTube ? 'flex-col md:flex-row items-start md:items-center' : 'flex-col md:flex-row items-center'} gap-2 md:gap-4 max-w-6xl`}>

                {/* Track Info */}
                <div className={`w-full md:flex-1 text-center md:text-left truncate px-2 ${isYouTube ? 'py-2 md:py-0' : ''}`}>
                    <h3 className="font-bold text-base md:text-lg truncate">{currentTrack.title}</h3>
                    <p className="text-xs md:text-sm text-slate-400">
                        {isYouTube ? 'Playing Video' : 'Playing Audio'}
                    </p>
                </div>

                {/* Player Container */}
                <div className={`${isYouTube ? 'w-full aspect-video md:w-[480px] md:h-[270px]' : 'w-full md:max-w-md'}`}>
                    <ReactPlayer
                        ref={playerRef}
                        url={currentTrack.fileUrl}
                        playing={isPlaying}
                        controls={true}
                        width="100%"
                        height={isYouTube ? "100%" : "50px"}
                        onProgress={handleProgress}
                        onPause={handlePause}
                        onPlay={handlePlay}
                        onEnded={handleEnded}
                        onReady={handleReady}
                        config={{
                            youtube: {
                                playerVars: { showinfo: 1 }
                            },
                        }}
                        style={!isYouTube ? { maxHeight: '50px' } : {}}
                    />
                </div>
            </div>
        </div>
    );
}
