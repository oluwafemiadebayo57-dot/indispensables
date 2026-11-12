import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html, attachments } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields (to, subject, html)' });
  }

  try {
    const data = await resend.emails.send({
      from: 'The Indispensables <onboarding@resend.dev>', 
      to: [to],
      subject: subject,
      html: html,
      attachments: attachments || [] // <-- Pass attachments to Resend
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}