# Pragati • Career Operations Desk

A data-driven career management and job application tracking platform with contextual outreach composition and automated follow-up intelligence.

## Features

- **Pipeline Board**: Lifecycle stage transitions (`Applied`, `Interview`, `Offer`, `Reject`) with real-time state recording.
- **Draft Studio**: Contextual communication engine capable of drafting customized cover letters and follow-up emails signed with the active candidate's credentials.
- **Scheduled Follow-ups**: Automated follow-up detection based on application timelines and communication history.
- **Original Company Logos**: Multi-provider favicon and brand logo resolution with fallback monograms.
- **Authentication & Security**: Multi-tenant data isolation supporting **Google OAuth 2.0** and **Email & Password Credentials** stored securely in MongoDB.
- **Collapsible Editorial Layout**: High-contrast, sharp newsprint typography and layout (`rounded-none`, `Playfair Display`, `Newsreader`, `Courier Prime`).

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your database and authentication keys:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/aijobtracker
   AUTH_SECRET=your_secret_here
   AUTH_GOOGLE_ID=your_google_client_id
   AUTH_GOOGLE_SECRET=your_google_client_secret
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
