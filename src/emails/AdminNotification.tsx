import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

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
  return (
    <Html lang="no">
      <Head />
      <Preview>{`Ny bestilling: ${productName} — ${amount} kr`}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={badge}>NY BESTILLING</Text>
            <Heading style={h1}>{productName}</Heading>
            <Text style={amountText}>{amount} kr</Text>
          </Section>

          {/* Detaljer */}
          <Section style={content}>
            <Text style={sectionLabel}>Kundeinfo</Text>
            <Section style={box}>
              <Row>
                <Column style={labelCol}><Text style={label}>Navn</Text></Column>
                <Column style={valueCol}><Text style={value}>{customerName}</Text></Column>
              </Row>
              <Hr style={divider} />
              <Row>
                <Column style={labelCol}><Text style={label}>E-post</Text></Column>
                <Column style={valueCol}>
                  <Text style={value}>
                    <a href={`mailto:${customerEmail}`} style={link}>{customerEmail}</a>
                  </Text>
                </Column>
              </Row>
            </Section>

            <Text style={sectionLabel}>Ordre</Text>
            <Section style={box}>
              <Row>
                <Column style={labelCol}><Text style={label}>Produkt</Text></Column>
                <Column style={valueCol}><Text style={value}>{productName}</Text></Column>
              </Row>
              <Hr style={divider} />
              <Row>
                <Column style={labelCol}><Text style={label}>Beløp</Text></Column>
                <Column style={valueCol}><Text style={value}>{amount} kr</Text></Column>
              </Row>
              <Hr style={divider} />
              <Row>
                <Column style={labelCol}><Text style={label}>Ordre-ID</Text></Column>
                <Column style={valueCol}><Text style={{ ...value, fontFamily: "monospace", fontSize: "13px", color: "#6b7280" }}>{orderId}</Text></Column>
              </Row>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section>
            <Text style={footer}>Milena Bua · Internt varsel · milenabua.no</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ── Stiler ───────────────────────────────────────────────────────────────────

const body = {
  backgroundColor: "#f5f4f2",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container = {
  maxWidth: "520px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden" as const,
  border: "1px solid #e8e6f0",
  boxShadow: "0 4px 24px rgba(26,26,46,0.06)",
};

const header = {
  backgroundColor: "#1a1a2e",
  padding: "32px 40px",
};

const badge = {
  color: "#818cf8",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  margin: "0 0 10px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 8px",
  letterSpacing: "-0.3px",
};

const amountText = {
  color: "#4F46E5",
  fontSize: "32px",
  fontWeight: "800",
  margin: "0",
  letterSpacing: "-1px",
};

const content = {
  padding: "28px 40px 16px",
};

const sectionLabel = {
  color: "#6b7280",
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  margin: "0 0 8px",
};

const box = {
  backgroundColor: "#faf9f7",
  borderRadius: "10px",
  padding: "4px 20px",
  marginBottom: "20px",
  border: "1px solid #e8e6f0",
};

const labelCol = { width: "35%" };
const valueCol = { width: "65%" };

const label = {
  color: "#9ca3af",
  fontSize: "13px",
  margin: "12px 0",
};

const value = {
  color: "#1a1a2e",
  fontSize: "14px",
  fontWeight: "600",
  margin: "12px 0",
};

const divider = {
  borderColor: "#e8e6f0",
  margin: "0",
};

const link = {
  color: "#4F46E5",
  textDecoration: "none",
};

const footerDivider = {
  borderColor: "#e8e6f0",
  margin: "0 40px",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
  padding: "20px 40px",
  margin: "0",
};
