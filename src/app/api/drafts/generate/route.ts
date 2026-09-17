import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { auth } from '@/auth';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const candidateName = session?.user?.name || 'Aarav Sharma';
    const userEmail = session?.user?.email || null;
    const userId = session?.user?.id || null;

    const { jobId, type, tone = 'Professional', focus = '', length = 'standard' } = await req.json();

    if (!jobId || !type) {
      return NextResponse.json({ error: 'Missing jobId or type' }, { status: 400 });
    }

    const db = await getDatabase();
    
    const job = await db.collection('jobs').findOne({ id: Number(jobId) });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Retrieve ALL past drafts linked to this application
    const allLinkedDrafts = await db.collection('drafts')
      .find({ jobId: Number(jobId) })
      .sort({ createdAt: 1 })
      .toArray();

    let pastDraftsSummary = 'No previous drafts on record for this application.';
    if (allLinkedDrafts.length > 0) {
      pastDraftsSummary = allLinkedDrafts.map((d, index) => 
        `Draft #${index + 1} [Type: ${d.type}, Status: ${d.status || 'draft'}]:\n"${d.contents}"`
      ).join('\n\n');
    }

    // Retrieve pipeline state transitions
    const transitionsSummary = (job.statusHistory && job.statusHistory.length > 0)
      ? job.statusHistory.map((t: any) => `- Changed from ${t.fromStatus || 'Start'} to ${t.toStatus} on ${t.timestamp ? new Date(t.timestamp).toLocaleDateString() : 'N/A'}`).join('\n')
      : `- Current status: ${job.status || 'Applied'}`;

    const draftTypeName = type === 'cover_letter' ? 'Cover Letter' : 'Follow-up Email';
    const roleName = job.role || job.description.split(',')[0];
    const companyName = job.company || 'the hiring company';

    const apiKey = process.env.GEMINI_API_KEY;
    let generatedContent = '';
    let engineUsed = 'langchain-heuristic-engine';

    if (apiKey && apiKey.length > 10) {
      try {
        // Contextual Composition Engine
        const promptTemplate = PromptTemplate.fromTemplate(
          `You are an executive career communications consultant and writing specialist.
Write a highly contextual, personalized, and compelling {draftTypeName} from the candidate {candidateName} based on the provided job parameters, status history, and previous communications.

Candidate Information:
- Candidate Name: {candidateName}

Tone & Strategy Guidelines:
- Desired Tone: {tone}
- Length / Style Preference: {length}
- Custom Focus / Key Emphasis: {focus}
- Emphasize relevant competencies, enthusiasm, and a clear call to action.
- When writing a follow-up email, strategically build on past communications without being redundant.
- Always sign the letter/email with the candidate's actual name: {candidateName} (NEVER output placeholder "[Your Name]").
- DO NOT wrap the output in quotation marks or markdown code fences.

Job Details:
- Role / Title: {roleName}
- Company: {companyName}
- Employment Type: {jobType}
- Job Description: {jobDescription}

Pipeline State History:
{transitionsSummary}

Prior Linked Drafts & Communication Memory:
{pastDraftsSummary}

Generate the final draft signed by {candidateName} now:
`
        );

        const model = new ChatGoogleGenerativeAI({
          model: 'gemini-1.5-flash',
          apiKey,
          temperature: 0.7,
        });

        const chain = promptTemplate.pipe(model).pipe(new StringOutputParser());

        generatedContent = await chain.invoke({
          draftTypeName,
          candidateName,
          tone,
          length: length === 'concise' ? 'Concise & direct (under 200 words)' : length === 'bullets' ? 'Structured with bullet points for key achievements' : 'Comprehensive & standard professional cover length',
          focus: focus || 'Standard best-practices emphasis for this role',
          roleName,
          companyName,
          jobType: job.type || 'Full-time',
          jobDescription: job.description,
          transitionsSummary,
          pastDraftsSummary,
        });
        engineUsed = 'langchain-gemini-1.5-flash';
      } catch (geminiErr) {
        console.warn('Gemini API call encountered an error. Falling back to contextual heuristic generator:', geminiErr);
      }
    }

    // If Gemini key is missing or failed auth, provide rich context-aware draft signed with candidateName
    if (!generatedContent) {
      console.log('Using contextual heuristic generator with candidate name:', candidateName);
      if (type === 'cover_letter') {
        generatedContent = `Dear Hiring Team at ${companyName},\n\nI am writing to express my strong interest in the ${roleName} position (${job.type}). Having reviewed the requirements for this role: "${job.description.slice(0, 100)}...", I am confident that my technical problem-solving capabilities and industry background make me an exceptional fit for your team.\n\nMy experience aligns directly with your mission, and I would welcome the opportunity to discuss how I can contribute in a ${tone.toLowerCase()} capacity.\n\nSincerely,\n${candidateName}`;
      } else {
        const hasPreviousFollowUp = allLinkedDrafts.some(d => d.type === 'follow_up_email');
        if (hasPreviousFollowUp) {
          generatedContent = `Dear Hiring Team at ${companyName},\n\nI hope you are having a productive week. I am following up on my previous note regarding my application for the ${roleName} role. My current pipeline status is "${job.status || 'Applied'}", and I remain exceptionally enthusiastic about the opportunity to join your engineering team.\n\nPlease let me know if there are any additional work samples, technical details, or portfolio items I can provide to assist in your evaluation.\n\nBest regards,\n${candidateName}`;
        } else {
          generatedContent = `Dear Hiring Team at ${companyName},\n\nI hope this email finds you well. I submitted my application for the ${roleName} position (${job.type}) on ${new Date(job.from).toLocaleDateString()}.\n\nGiven the strong alignment between my background and your team's current focus, I wanted to reiterate my keen interest in this position. I would appreciate any updates on the interview schedule or next steps.\n\nThank you for your time and consideration,\n${candidateName}`;
        }
      }
    }

    // Save newly generated draft to DB
    const newDraftId = Math.floor(Math.random() * 1000000) + 1000;
    await db.collection('drafts').insertOne({
      id: newDraftId,
      jobId: job.id,
      userEmail,
      userId,
      type,
      tone,
      engine: engineUsed,
      contents: generatedContent,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      draft: { 
        id: newDraftId,
        contents: generatedContent,
        engine: engineUsed === 'langchain-gemini-1.5-flash' ? 'Contextual Writing Engine' : 'Heuristic Writing Engine'
      } 
    });
  } catch (error) {
    console.error('Generate Draft Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
