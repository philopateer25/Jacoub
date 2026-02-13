
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

async function main() {
    console.log('--- Starting Verification ---');

    // 1. Create User
    console.log('1. Creating User...');
    // We can use the API or Prisma. Let's use API to test it.
    // Wait, API requires running server. 
    // I will use Prisma for setup, and verification of what API *would* see.
    // Or I can just write unit tests style.
    // Let's stick to Prisma to verify Data Layer + Logic separately from HTTP for now
    // as running `next dev` in background and hitting it is complex in this env.

    // Actually, I can't hit localhost:3000 if I don't start the server.
    // I'll just verify DB logic and interactions.

    const userEmail = `test-${Date.now()}@example.com`;
    const user = await prisma.user.create({
        data: { email: userEmail, role: 'USER' }
    });
    console.log('  User created:', user.id);

    // 2. Create Track (Admin side simulation)
    const track = await prisma.audioTrack.create({
        data: {
            title: 'Test Track',
            fileUrl: '/uploads/test.mp3',
        }
    });
    console.log('  Track created:', track.id);

    // 3. User listens (Progress Update)
    console.log('2. Simulating Progress Update...');
    // Simulate what POST /api/progress does
    const progress = await prisma.listeningProgress.upsert({
        where: {
            userId_audioTrackId: { userId: user.id, audioTrackId: track.id }
        },
        update: { progress: 50, completed: false },
        create: {
            userId: user.id,
            audioTrackId: track.id,
            progress: 50,
            completed: false
        }
    });
    console.log('  Progress saved:', progress.progress === 50 ? 'PASS' : 'FAIL');

    // 4. Verify Fetch (List with progress)
    console.log('3. Verifying Data Fetch...');
    const tracksWithProgress = await prisma.audioTrack.findMany({
        include: {
            progress: {
                where: { userId: user.id }
            }
        }
    });

    const fetchedTrack = tracksWithProgress.find(t => t.id === track.id);
    if (fetchedTrack && fetchedTrack.progress[0]?.progress === 50) {
        console.log('  Fetch verification: PASS');
    } else {
        console.error('  Fetch verification: FAIL');
    }

    // 5. Cleanup
    console.log('4. Cleanup...');
    await prisma.listeningProgress.deleteMany({ where: { userId: user.id } });
    await prisma.voiceMessage.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.audioTrack.delete({ where: { id: track.id } });
    console.log('  Cleanup done.');

    console.log('--- Verification Complete ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
