import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    try {
        const tracks = await prisma.audioTrack.findMany({
            include: userId
                ? {
                    progress: {
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
            // @ts-ignore - handled by include above
            const userProgress = track.progress?.[0];

            // Create a clean object without the array
            // detailed below
            const { progress: _, ...trackData } = track as any;

            return {
                ...trackData,
                progress: userProgress ? {
                    completed: userProgress.completed,
                    currentTime: userProgress.progress,
                    listenCount: userProgress.listenCount
                } : null
            };
        });

        return NextResponse.json(formattedTracks);
    } catch (error) {
        console.error('Error fetching tracks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
