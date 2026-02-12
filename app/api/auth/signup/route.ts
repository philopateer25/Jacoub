import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { username } = await req.json();

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 });
        }

        // Check if exists
        // Email is used as username
        const existingUser = await prisma.user.findUnique({
            where: { email: username },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }

        const isAdmin = username.endsWith('.ad');
        const role = isAdmin ? 'ADMIN' : 'USER';

        const user = await prisma.user.create({
            data: {
                email: username,
                role,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
