
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { ids } = await req.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
        }

        // Delete from DB
        await prisma.answer.deleteMany({
            where: { id: { in: ids } }
        });

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error) {
        console.error('Batch delete answers error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
