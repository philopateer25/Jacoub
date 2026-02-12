import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { userId, questionId, text } = await req.json();

        if (!userId || !questionId || !text) {
            return NextResponse.json({ error: 'User, Question and Text required' }, { status: 400 });
        }

        const answer = await prisma.answer.create({
            data: {
                userId,
                questionId,
                text,
            },
        });

        return NextResponse.json(answer);
    } catch (error) {
        console.error('Create answer error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const answers = await prisma.answer.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { email: true, id: true }
                },
                question: {
                    select: {
                        text: true,
                        week: {
                            select: { title: true, order: true }
                        }
                    }
                }
            }
        });
        return NextResponse.json(answers);
    } catch (error) {
        console.error('Fetch answers error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
