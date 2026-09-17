import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { auth } from '@/auth';
import { z } from 'zod';

const createApplicationSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role title is required'),
  from: z.string().default(() => new Date().toISOString().split('T')[0]),
  to: z.string().default(() => new Date().toISOString().split('T')[0]),
  type: z.string().default('full-time'),
  status: z.enum(['Applied', 'Interview', 'Offer', 'Reject']).default('Applied'),
  description: z.string().min(1, 'Description is required'),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || null;
    const userId = session?.user?.id || null;

    const body = await req.json();
    const data = createApplicationSchema.parse(body);

    const db = await getDatabase();

    // Find highest ID for integer sequence ID consistency
    const highestJob = await db.collection('jobs').find().sort({ id: -1 }).limit(1).toArray();
    const nextId = highestJob.length > 0 && typeof highestJob[0].id === 'number' ? highestJob[0].id + 1 : Date.now();

    const newApplication = {
      id: nextId,
      company: data.company,
      role: data.role,
      from: data.from,
      to: data.to,
      type: data.type,
      status: data.status,
      description: data.description,
      userEmail,
      userId,
      statusHistory: [
        {
          fromStatus: null,
          toStatus: data.status,
          timestamp: new Date().toISOString(),
          note: `Application logged as ${data.status}`
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('jobs').insertOne(newApplication);

    return NextResponse.json({
      success: true,
      message: 'Application successfully logged.',
      application: newApplication
    });
  } catch (error) {
    console.error('Create Application Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}
