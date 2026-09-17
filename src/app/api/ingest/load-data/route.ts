import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { auth } from '@/auth';
import { z } from 'zod';
import Papa from 'papaparse';

const jobSchema = z.object({
  id: z.coerce.number(),
  from: z.string(),
  to: z.string(),
  type: z.string(),
  description: z.string(),
  company: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
});

const draftSchema = z.object({
  id: z.coerce.number(),
  jobId: z.coerce.number(),
  type: z.string(),
  contents: z.string(),
  status: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let jobsList: any[] = [];
    let draftsList: any[] = [];

    // Check if raw CSV was submitted
    if (body.jobsCsv) {
      const parsedJobsCsv = Papa.parse(body.jobsCsv, { header: true, skipEmptyLines: true });
      jobsList = parsedJobsCsv.data.map((row: any) => ({
        id: Number(row.id || row['<id>']),
        from: String(row.from || row['<from>'] || ''),
        to: String(row.to || row['<to>'] || ''),
        type: String(row.type || row['<type>'] || 'full-time'),
        description: String(row.description || row['<description>'] || ''),
      }));
    } else if (body.jobs && Array.isArray(body.jobs)) {
      jobsList = body.jobs;
    }

    if (body.draftsCsv) {
      const parsedDraftsCsv = Papa.parse(body.draftsCsv, { header: true, skipEmptyLines: true });
      draftsList = parsedDraftsCsv.data.map((row: any) => ({
        id: Number(row.id || row['<id>']),
        jobId: Number(row.jobId || row['<jobId>']),
        type: String(row.type || row['<type>'] || 'cover_letter'),
        contents: String(row.contents || row['<contents>'] || ''),
        status: String(row.status || row['<status>'] || 'draft'),
      }));
    } else if (body.drafts && Array.isArray(body.drafts)) {
      draftsList = body.drafts;
    }

    // Validate
    const validatedJobs = jobsList.map(j => jobSchema.parse(j));
    const validatedDrafts = draftsList.map(d => draftSchema.parse(d));

    const db = await getDatabase();
    
    const session = await auth();
    const userEmail = session?.user?.email || null;
    const userId = session?.user?.id || null;

    // Process jobs
    if (validatedJobs.length > 0) {
      const jobsCollection = db.collection('jobs');
      
      const bulkOps = validatedJobs.map((job) => {
        // Extract company and role heuristics if missing from description
        const descParts = job.description.split(',');
        const rolePart = descParts[0]?.trim() || 'Software Engineer';
        const locationPart = descParts[1]?.trim() || '';

        return {
          updateOne: {
            filter: { id: job.id },
            update: { 
              $set: {
                id: job.id,
                from: job.from,
                to: job.to,
                type: job.type,
                description: job.description,
                role: job.role || rolePart,
                company: job.company || (locationPart ? `Tech Corp (${locationPart})` : 'Global Tech Enterprise'),
                status: job.status || "Applied",
                userEmail,
                userId,
                updatedAt: new Date(),
              },
              $setOnInsert: { 
                createdAt: new Date(),
                statusHistory: [
                  {
                    fromStatus: null,
                    toStatus: job.status || "Applied",
                    timestamp: new Date().toISOString(),
                    note: 'Ingested into pipeline via Evaluation Dataset'
                  }
                ]
              }
            },
            upsert: true
          }
        };
      });
      
      await jobsCollection.bulkWrite(bulkOps);
    }

    // Process drafts
    if (validatedDrafts.length > 0) {
      const draftsCollection = db.collection('drafts');
      
      const bulkOps = validatedDrafts.map((draft) => ({
        updateOne: {
          filter: { id: draft.id },
          update: { 
            $set: {
              id: draft.id,
              jobId: draft.jobId,
              type: draft.type,
              contents: draft.contents,
              status: draft.status,
              engine: 'evaluator-dataset-seed',
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() }
          },
          upsert: true
        }
      }));
      
      await draftsCollection.bulkWrite(bulkOps);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${validatedJobs.length} jobs and ${validatedDrafts.length} linked drafts into MongoDB.`,
      counts: {
        jobs: validatedJobs.length,
        drafts: validatedDrafts.length
      }
    });
  } catch (error) {
    console.error('Ingest Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}
