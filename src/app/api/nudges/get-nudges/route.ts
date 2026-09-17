import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { auth } from '@/auth';
import { differenceInDays } from 'date-fns';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || null;
    const userId = session?.user?.id || null;

    const { searchParams } = new URL(req.url);
    const simulatedDateStr = searchParams.get('date');
    const currentDate = simulatedDateStr ? new Date(simulatedDateStr) : new Date();

    const db = await getDatabase();

    const jobQuery: any = {
      status: { $in: ['Applied', 'Interview'] }
    };

    if (userEmail || userId) {
      jobQuery.$or = [
        ...(userEmail ? [{ userEmail }] : []),
        ...(userId ? [{ userId }] : [])
      ];
    }

    const jobs = await db.collection('jobs').find(jobQuery).toArray();

    const jobIds = jobs.map(j => j.id);
    const drafts = await db.collection('drafts').find({ jobId: { $in: jobIds } }).toArray();

    const nudges = [];

    for (const job of jobs) {
      const appDate = new Date(job.from);
      
      if (isNaN(appDate.getTime())) continue;

      const daysSinceApplied = differenceInDays(currentDate, appDate);
      const jobDrafts = drafts.filter(d => d.jobId === job.id);

      // Rule 1: 7 days since applied and no follow up sent
      if (job.status === 'Applied' && daysSinceApplied >= 7) {
        const hasFollowUp = jobDrafts.some(d => d.type === 'follow_up_email' && d.status === 'sent');
        if (!hasFollowUp) {
          nudges.push({
            jobId: job.id,
            jobTitle: job.description,
            company: job.company || 'Unknown Company',
            rule: '7_days_post_applied',
            message: `It has been ${daysSinceApplied} days since you applied. Time to send a follow-up email!`,
            action: 'generate_follow_up'
          });
        }
      }

      // Rule 2: 14 days inactive (Stale application)
      if (job.status === 'Applied' && daysSinceApplied >= 14) {
        nudges.push({
          jobId: job.id,
          jobTitle: job.description,
          company: job.company || 'Unknown Company',
          rule: '14_days_stale',
          message: `Application is stale (${daysSinceApplied} days). Consider withdrawing or sending a final ping.`,
          action: 'review_application'
        });
      }
      
      // Rule 3: Post-interview thank you
      if (job.status === 'Interview') {
        const lastUpdated = job.updatedAt ? new Date(job.updatedAt) : new Date();
        const daysSinceInterview = differenceInDays(currentDate, lastUpdated);
        if (daysSinceInterview >= 1 && daysSinceInterview < 3) {
           nudges.push({
            jobId: job.id,
            jobTitle: job.description,
            company: job.company || 'Unknown Company',
            rule: 'post_interview_thank_you',
            message: `You recently had an interview. Send a tailored thank-you note now.`,
            action: 'generate_thank_you'
          });
        }
      }
    }

    return NextResponse.json({ success: true, nudges, simulatedDate: currentDate });
  } catch (error) {
    console.error('Nudges Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
