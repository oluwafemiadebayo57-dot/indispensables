// api/send-email.js
import { Resend } from 'resend';

// Vercel will securely provide the API key we set in the dashboard
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields (to, subject, html)' });
  }

  try {
    const data = await resend.emails.send({
      from: 'The Indispensables <onboarding@resend.dev>', // Use your verified domain later
      to: [to],
      subject: subject,
      html: html,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}