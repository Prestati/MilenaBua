import { Resend } from "resend";
import OrderConfirmation from "@/emails/OrderConfirmation";
import AdminNotification from "@/emails/AdminNotification";
import WelcomeEmail from "@/emails/WelcomeEmail";
import { readContent } from "@/lib/content";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendOrderEmailsProps {
  customerName: string;
  customerEmail: string;
  productName: string;
  amount: number;
  orderId: string;
  orderDate: string;
  fileUrl?: string;
}

interface EmailSettings {
  thankYouMessage?: string;
  projectMessage?: string;
  signoff?: string;
  welcomeSubject?: string;
  welcomeBody?: string;
  welcomePdfUrl?: string;
  welcomePdfButtonText?: string;
  welcomeHeaderImageUrl?: string;
}

export async function sendOrderEmails(props: SendOrderEmailsProps) {
  const { customerName, customerEmail, productName, amount, orderId, orderDate, fileUrl } = props;

  let emailSettings: EmailSettings = {};
  try {
    emailSettings = await readContent<EmailSettings>("email-settings.json");
  } catch {
    // fallback to defaults in OrderConfirmation
  }

  const results = await Promise.all([
    resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: customerEmail,
      subject: `Takk for kjøpet! – ${productName}`,
      react: OrderConfirmation({ customerName, productName, amount, orderDate, fileUrl, ...emailSettings }),
    }),
    resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.EMAIL_TO!,
      subject: `Ny bestilling: ${productName}`,
      react: AdminNotification({ customerName, customerEmail, productName, amount, orderId }),
    }),
  ]);

  for (const { error } of results) {
    if (error) throw new Error(error.message);
  }
}

export async function sendWelcomeEmail({
  recipientEmail,
  recipientName,
}: {
  recipientEmail: string;
  recipientName?: string;
}) {
  let settings: EmailSettings = {};
  try {
    settings = await readContent<EmailSettings>("email-settings.json");
  } catch { /* use defaults */ }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.milenabua.no";
  const unsubscribeUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: recipientEmail,
    subject: settings.welcomeSubject ?? "Velkommen — her er gaven din! 🎁",
    react: WelcomeEmail({
      recipientName,
      subject: settings.welcomeSubject,
      body: settings.welcomeBody,
      pdfUrl: settings.welcomePdfUrl || undefined,
      pdfButtonText: settings.welcomePdfButtonText,
      headerImageUrl: settings.welcomeHeaderImageUrl || undefined,
      unsubscribeUrl,
    }),
  });

  if (error) throw new Error(error.message);
}
