
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Find the message to get the fileUrl
        const message = await prisma.voiceMessage.findUnique({
            where: { id },
        });

        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        // 2. Delete from Vercel Blob
        if (message.fileUrl) {
            try {
                await del(message.fileUrl);
            } catch (blobError) {
                console.error('Error deleting blob:', blobError);
                // Continue to delete from DB even if blob fails (cleanup)
            }
        }

        // 3. Delete from Database
        await prisma.voiceMessage.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting message:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { viewed } = body;

        const message = await prisma.voiceMessage.update({
            where: { id },
            data: { viewed },
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error updating message:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
