import { Resend } from "resend";
import OrderConfirmation from "@/emails/OrderConfirmation";
import AdminNotification from "@/emails/AdminNotification";
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
