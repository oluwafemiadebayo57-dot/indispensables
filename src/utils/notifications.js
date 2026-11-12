import { sendEmail } from './sendEmail';

// Add the emails of the Presidency here (comma separated if you have multiple)
const PRESIDENCY_EMAILS = ['oluwafemiadebayo57@gmail.com']; 

export async function notifyPresidency(subject, message) {
  for (const email of PRESIDENCY_EMAILS) {
    await sendEmail({
      to: email,
      subject: `[OD11 Alert] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #6B2D91;">RCCG Ondo Province 11</h2>
          <h3 style="color: #F28C28;">Website Notification</h3>
          <p style="font-size: 16px;">${message}</p>
          <br/>
          <a href="https://indispensables-iota.vercel.app/#/login" style="background-color: #6B2D91; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Log in to Dashboard</a>
          <br/><br/>
          <p style="font-size: 12px; color: #888;">This is an automated message from your website.</p>
        </div>
      `
    });
  }
}