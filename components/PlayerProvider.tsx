'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Track {
    id: string;
    title: string;
    fileUrl: string;
    progress?: {
        currentTime: number;
        completed: boolean;
    }
}

interface PlayerContextType {
    currentTrack: Track | null;
    playTrack: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

    const playTrack = (track: Track) => {
        setCurrentTrack(track);
    };

    return (
        <PlayerContext.Provider value={{ currentTrack, playTrack }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (!context) throw new Error('usePlayer must be used within PlayerProvider');
    return context;
}
