import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { username } = await req.json();

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 });
        }

        // Login: Verify existence only
        const user = await prisma.user.findUnique({
            where: { email: username },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found. Please sign up first.' }, { status: 401 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
