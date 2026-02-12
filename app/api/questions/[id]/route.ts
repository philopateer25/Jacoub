import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { text } = await req.json();

        if (!id || !text) return NextResponse.json({ error: 'ID and text required' }, { status: 400 });

        const question = await prisma.question.update({
            where: { id },
            data: { text },
        });

        return NextResponse.json(question);
    } catch (error) {
        console.error('Update question error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.question.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete question error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
