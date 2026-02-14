import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('userId') as string;
        const audioTrackId = formData.get('audioTrackId') as string | null;

        if (!file || !userId) {
            return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
        }

        // Upload to Vercel Blob
        const blob = await put(`voice-messages/${Date.now()}-${file.name}`, file, {
            access: 'public',
        });

        const message = await prisma.voiceMessage.create({
            data: {
                userId,
                fileUrl: blob.url,
                audioTrackId: audioTrackId || undefined,
            },
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error('Message upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const messages = await prisma.voiceMessage.findMany({
            include: {
                user: {
                    select: { email: true, id: true },
                },
                audioTrack: {
                    select: {
                        title: true,
                        id: true,
                        week: {
                            select: { title: true, order: true }
                        }
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(messages);
    } catch (error) {
        console.error('Fetch messages error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
