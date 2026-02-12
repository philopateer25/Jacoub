import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    try {
        const tracks = await prisma.audioTrack.findMany({
            include: userId
                ? {
                    listeningProgress: {
                        where: {
                            userId: userId,
                        },
                    },
                }
                : undefined,
            orderBy: {
                createdAt: 'desc',
            },
        });

        const formattedTracks = tracks.map((track) => {
            const progress = track.listeningProgress?.[0]; // specific to this user
            return {
                ...track,
                listeningProgress: undefined, // remove array
                progress: progress ? {
                    completed: progress.completed,
                    currentTime: progress.progress,
                    listenCount: progress.listenCount
                } : null
            };
        });

        return NextResponse.json(formattedTracks);
    } catch (error) {
        console.error('Error fetching tracks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
