import { Body, Container, Head, Heading, Hr, Html, Preview, Row, Column, Section, Text } from "@react-email/components";

interface AdminNotificationProps {
  customerName: string;
  customerEmail: string;
  productName: string;
  amount: number;
  orderId: string;
}

export default function AdminNotification({
  customerName = "Ola Nordmann",
  customerEmail = "ola@example.com",
  productName = "Produktnavn",
  amount = 299,
  orderId = "ord_123456",
}: AdminNotificationProps) {
  const preview = "Ny bestilling: " + productName + " - " + String(amount) + " kr";
  return (
    <Html lang="no">
      <Head />
      <Preview>{preview}</Preview>
      <Body><Container><Heading>{productName}</Heading><Text>{customerName}</Text><Text>{customerEmail}</Text><Text>{String(amount)} kr</Text><Text>{orderId}</Text></Container></Body>
    </Html>
  );
}
