import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { title } = await req.json();

        if (!id || !title) return NextResponse.json({ error: 'ID and title required' }, { status: 400 });

        const track = await prisma.audioTrack.update({
            where: { id },
            data: { title },
        });

        return NextResponse.json(track);
    } catch (error) {
        console.error('Update track error:', error);
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

        // Optional: Delete file from disk?
        // Taking a safe approach: Check if file exists and delete it.
        const track = await prisma.audioTrack.findUnique({ where: { id } });
        if (track?.fileUrl) {
            try {
                const filePath = path.join(process.cwd(), 'public', track.fileUrl);
                await fs.unlink(filePath);
            } catch (e) {
                console.warn('Failed to delete file from disk:', e);
            }
        }

        await prisma.audioTrack.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete track error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
