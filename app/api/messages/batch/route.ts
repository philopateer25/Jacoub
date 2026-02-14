
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

export async function POST(req: NextRequest) {
    try {
        const { ids } = await req.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
        }

        // 1. Fetch messages to get fileUrls
        const messages = await prisma.voiceMessage.findMany({
            where: { id: { in: ids } },
            select: { id: true, fileUrl: true }
        });

        // 2. Delete Blobs
        const fileUrls = messages.map(m => m.fileUrl).filter(Boolean);
        if (fileUrls.length > 0) {
            try {
                // Determine if we can batch delete or need individual
                // @vercel/blob del accepts string or string[]
                await del(fileUrls);
            } catch (e) {
                console.error('Batch blob delete error:', e);
            }
        }

        // 3. Delete from DB
        await prisma.voiceMessage.deleteMany({
            where: { id: { in: ids } }
        });

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error) {
        console.error('Batch delete error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
