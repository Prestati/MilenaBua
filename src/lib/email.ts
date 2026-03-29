import { Resend } from "resend";
import OrderConfirmation from "@/emails/OrderConfirmation";
import AdminNotification from "@/emails/AdminNotification";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendOrderEmailsProps {
  customerName: string;
  customerEmail: string;
  productName: string;
  amount: number;
  orderId: string;
  orderDate: string;
}

export async function sendOrderEmails(props: SendOrderEmailsProps) {
  const { customerName, customerEmail, productName, amount, orderId, orderDate } = props;

  await Promise.all([
    resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: customerEmail,
      subject: `Takk for kjøpet! – ${productName}`,
      react: OrderConfirmation({ customerName, productName, amount, orderDate }),
    }),
    resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.EMAIL_TO!,
      subject: `Ny bestilling: ${productName}`,
      react: AdminNotification({ customerName, customerEmail, productName, amount, orderId }),
    }),
  ]);
}
