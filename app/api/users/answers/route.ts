import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'UserId required' }, { status: 400 });
        }

        const answers = await prisma.answer.findMany({
            where: { userId },
        });

        return NextResponse.json(answers);
    } catch (error) {
        console.error('Fetch user answers error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
