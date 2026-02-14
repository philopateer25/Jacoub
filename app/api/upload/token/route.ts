
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, /* clientPayload */) => {
                // Authenticate the user here if needed
                // const { user } = await auth();
                // if (!user) throw new Error('Unauthorized');

                return {
                    allowedContentTypes: ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/webm', 'audio/mp4', 'audio/aac'],
                    tokenPayload: JSON.stringify({
                        // optional payload to verify in onUploadCompleted
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // This is called via webhook after upload
                console.log('blob uploaded', blob.url);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }, // The webhook will retry 5 times automatically if the status code is 400+
        );
    }
}
