import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, audioTrackId, progress, completed } = body;

        if (!userId || !audioTrackId) {
            return NextResponse.json({ error: 'Missing userId or audioTrackId' }, { status: 400 });
        }

        // Upsert progress
        const record = await prisma.listeningProgress.upsert({
            where: {
                userId_audioTrackId: {
                    userId,
                    audioTrackId,
                },
            },
            update: {
                progress,
                completed: completed || false,
                lastListenedAt: new Date(),
                // Increment listenCount only if completed just now? 
                // Or client sends explicit "finished" signal?
                // For now, let's say if completed is true AND it wasn't before?
                // Simplifying: Client should handle 'listenCount' logic or we just increment if completed is true
                // But upsert is atomic.
                // Let's rely on client sending the new count or just increment API?
                // Let's keep it simple: just update progress. 
                // If 'completed' switches to true, we could increment.
            },
            create: {
                userId,
                audioTrackId,
                progress: progress || 0,
                completed: completed || false,
                listenCount: completed ? 1 : 0,
            },
        });

        // logic to increment listen count if it was not completed and now is?
        // This requires reading first.
        // Let's assume the client sends the incremented count or we separate "complete" event.
        // For this MVP, we just save what client sends.

        return NextResponse.json(record);
    } catch (error) {
        console.error('Error updating progress:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
