import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const weeks = await prisma.week.findMany({
            orderBy: { order: 'asc' },
            include: {
                tracks: true,
                questions: true,
            },
        });

        // Transform to mixed content list
        const weeksWithContent = weeks.map(week => {
            const tracks = week.tracks.map(t => ({ ...t, type: 'TRACK' }));
            const questions = week.questions.map(q => ({ ...q, type: 'QUESTION' }));

            // Combine and sort by order
            const content = [...tracks, ...questions].sort((a, b) => a.order - b.order);

            return {
                ...week,
                content
            };
        });

        return NextResponse.json(weeksWithContent);
    } catch (error) {
        console.error('Fetch weeks error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { title, order } = await req.json();

        if (!title || order === undefined) {
            return NextResponse.json({ error: 'Title and order required' }, { status: 400 });
        }

        const week = await prisma.week.create({
            data: {
                title,
                order,
            },
        });

        return NextResponse.json(week);
    } catch (error) {
        console.error('Create week error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
