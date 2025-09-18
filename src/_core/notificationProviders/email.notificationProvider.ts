import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailNotification(subject: string, body: string) {
  if (!process.env.NOTIFY_EMAIL_TO) return;

  await resend.emails.send({
    from: "Open Farm <noreply@openfarm.io>",
    to: [process.env.NOTIFY_EMAIL_TO],
    subject,
    text: body,
  });
}
