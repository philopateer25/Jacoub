import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { weekId, text } = await req.json();

        if (!weekId || !text) {
            return NextResponse.json({ error: 'WeekId and text required' }, { status: 400 });
        }

        const texts = Array.isArray(text) ? text : [text];
        const createdQuestions = [];

        // Get initial max order
        const lastTrack = await prisma.audioTrack.findFirst({
            where: { weekId },
            orderBy: { order: 'desc' }
        });
        const lastQuestion = await prisma.question.findFirst({
            where: { weekId },
            orderBy: { order: 'desc' }
        });

        let currentOrder = Math.max(lastTrack?.order || 0, lastQuestion?.order || 0) + 1;

        for (const t of texts) {
            if (!t.trim()) continue;

            const q = await prisma.question.create({
                data: {
                    weekId,
                    text: t,
                    order: currentOrder,
                },
            });
            createdQuestions.push(q);
            currentOrder++;
        }

        return NextResponse.json(createdQuestions.length === 1 ? createdQuestions[0] : createdQuestions);
    } catch (error) {
        console.error('Create question error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
