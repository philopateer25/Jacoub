import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;
        const weekId = formData.get('weekId') as string;

        if (!file || !title) {
            return NextResponse.json({ error: 'Missing file or title' }, { status: 400 });
        }

        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
            access: 'public',
        });

        // Calculate Order
        let newOrder = 0;
        if (weekId) {
            const lastTrack = await prisma.audioTrack.findFirst({
                where: { weekId },
                orderBy: { order: 'desc' }
            });
            const lastQuestion = await prisma.question.findFirst({
                where: { weekId },
                orderBy: { order: 'desc' }
            });
            const maxOrder = Math.max(lastTrack?.order || 0, lastQuestion?.order || 0);
            newOrder = maxOrder + 1;
        }

        const track = await prisma.audioTrack.create({
            data: {
                title,
                fileUrl: blob.url,
                weekId: weekId || undefined,
                order: newOrder,
            },
        });

        return NextResponse.json(track);
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
