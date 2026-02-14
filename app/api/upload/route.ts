
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, weekId, type, url } = body;

        if (!title || !weekId || !type || !url) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        console.log(`[Upload] Saving metadata. Type: ${type}, Title: ${title}, Week: ${weekId}, URL: ${url}`);

        let finalUrl = url;

        // 2. Save to Database
        // Get current max order for the week to append at the end
        const lastTrack = await prisma.audioTrack.findFirst({
            where: { weekId },
            orderBy: { order: 'desc' },
        });

        const newOrder = (lastTrack?.order ?? 0) + 1;
        console.log(`[Upload] Creating DB entry. Order: ${newOrder}`);

        const track = await prisma.audioTrack.create({
            data: {
                title,
                fileUrl: finalUrl,
                type: type, // Ensure type is passed specifically
                weekId,
                order: newOrder,
            },
        });
        console.log(`[Upload] Success! ID: ${track.id}`);

        return NextResponse.json(track);
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
