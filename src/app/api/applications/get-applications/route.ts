import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email && !session?.user?.id) {
      return NextResponse.json({ success: true, jobs: [], authenticated: false });
    }

    const userEmail = session.user.email;
    const userId = session.user.id;

    const db = await getDatabase();
    
    // Fetch user-isolated applications
    const query = userEmail 
      ? { $or: [{ userEmail }, { userId }] }
      : { userId };

    let jobs = await db.collection('jobs').find(query).sort({ createdAt: -1 }).toArray();

    // If user has no jobs, migrate any unassigned legacy jobs to this user
    if (jobs.length === 0) {
      const unassignedJobs = await db.collection('jobs').find({ 
        userEmail: { $exists: false }, 
        userId: { $exists: false } 
      }).sort({ createdAt: -1 }).toArray();

      if (unassignedJobs.length > 0) {
        await db.collection('jobs').updateMany(
          { userEmail: { $exists: false }, userId: { $exists: false } },
          { $set: { userEmail, userId } }
        );
        jobs = unassignedJobs.map(j => ({ ...j, userEmail, userId }));
      }
    }
    
    // Fetch associated drafts
    const jobIds = jobs.map(j => j.id);
    const drafts = await db.collection('drafts').find({ jobId: { $in: jobIds } }).toArray();
    
    const jobsWithRelations = jobs.map(job => ({
      ...job,
      drafts: drafts.filter(d => d.jobId === job.id)
    }));

    return NextResponse.json({ success: true, jobs: jobsWithRelations, authenticated: true });
  } catch (error) {
    console.error('Fetch Jobs Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
