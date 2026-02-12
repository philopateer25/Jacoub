import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.week.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete week error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { title, order } = await req.json();

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const week = await prisma.week.update({
            where: { id },
            data: {
                title,
                order,
            },
        });

        return NextResponse.json(week);
    } catch (error) {
        console.error('Update week error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
