import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const trackId = params.id;

        if (!trackId) {
            return NextResponse.json({ error: 'Track ID required' }, { status: 400 });
        }

        const progressData = await prisma.listeningProgress.findMany({
            where: {
                audioTrackId: trackId,
            },
            include: {
                user: {
                    select: { email: true, id: true },
                },
            },
            orderBy: { lastListenedAt: 'desc' },
        });

        const formatted = progressData.map(p => ({
            userId: p.userId,
            email: p.user.email,
            progress: p.progress,
            completed: p.completed,
            listenCount: p.listenCount,
            lastListenedAt: p.lastListenedAt
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
