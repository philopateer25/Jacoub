import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;
        const weekId = formData.get('weekId') as string;

        if (!file || !title || !weekId) {
            return NextResponse.json(
                { error: 'File, title, and weekId are required' },
                { status: 400 }
            );
        }

        // 1. Upload to Vercel Blob
        const blob = await put(file.name, file, {
            access: 'public',
        });

        // 2. Save to Database
        // Get current max order for the week to append at the end
        const lastTrack = await prisma.audioTrack.findFirst({
            where: { weekId },
            orderBy: { order: 'desc' },
        });

        const newOrder = (lastTrack?.order ?? 0) + 1;

        const track = await prisma.audioTrack.create({
            data: {
                title,
                fileUrl: blob.url,
                weekId,
                order: newOrder,
            },
        });

        return NextResponse.json(track);
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
