import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, audioTrackId } = body;

        if (!userId || !audioTrackId) {
            return NextResponse.json({ error: 'Missing userId or audioTrackId' }, { status: 400 });
        }

        // Upsert to ensure record exists, then increment
        // We can use a transaction or just upsert then update.
        // Prisma upsert create/update

        const record = await prisma.listeningProgress.upsert({
            where: {
                userId_audioTrackId: {
                    userId,
                    audioTrackId,
                },
            },
            update: {
                completed: true,
                listenCount: { increment: 1 },
                lastListenedAt: new Date(),
            },
            create: {
                userId,
                audioTrackId,
                progress: 0,
                completed: true,
                listenCount: 1,
            },
        });

        return NextResponse.json(record);
    } catch (error) {
        console.error('Error completing track:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
