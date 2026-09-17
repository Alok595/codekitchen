import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function PUT(req: Request) {
  try {
    const { id, status } = await req.json();
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const db = await getDatabase();
    
    const job = await db.collection('jobs').findOne({ id: Number(id) });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    if (job.status !== status) {
      const transition = {
        fromStatus: job.status || 'Applied',
        toStatus: status,
        timestamp: new Date().toISOString(),
        note: `Moved pipeline phase to ${status}`
      };

      await db.collection('jobs').updateOne(
        { id: Number(id) },
        { 
          $set: { status, updatedAt: new Date() },
          $push: { statusHistory: transition } as any
        }
      );
      
      await db.collection('auditLogs').insertOne({
        jobId: Number(id),
        previousState: job.status,
        newState: status,
        createdAt: new Date()
      });
    }

    return NextResponse.json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    console.error('Update Job Status Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

