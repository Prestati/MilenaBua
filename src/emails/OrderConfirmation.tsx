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

interface OrderConfirmationProps {
  customerName: string;
  productName: string;
  amount: number;
  orderDate: string;
  fileUrl?: string;
}

export default function OrderConfirmation({
  customerName = "Ola Nordmann",
  productName = "Produktnavn",
  amount = 299,
  orderDate = "29. mars 2026",
  fileUrl,
}: OrderConfirmationProps) {
  return (
    <Html lang="no">
      <Head />
      <Preview>Takk for kjøpet av {productName} — ordrebekreftelse</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={logo}>Milena Bua</Text>
          </Section>

          {/* Innhold */}
          <Section style={content}>
            <Heading style={h1}>Takk for kjøpet, {customerName}!</Heading>
            <Text style={text}>
              Vi har mottatt bestillingen din og den er bekreftet. Her er en oppsummering:
            </Text>

            {/* Ordredetaljer */}
            <Section style={orderBox}>
              <Row>
                <Column style={labelCol}>
                  <Text style={label}>Produkt</Text>
                </Column>
                <Column style={valueCol}>
                  <Text style={value}>{productName}</Text>
                </Column>
              </Row>
              <Hr style={divider} />
              <Row>
                <Column style={labelCol}>
                  <Text style={label}>Beløp</Text>
                </Column>
                <Column style={valueCol}>
                  <Text style={value}>{amount} kr</Text>
                </Column>
              </Row>
              <Hr style={divider} />
              <Row>
                <Column style={labelCol}>
                  <Text style={label}>Dato</Text>
                </Column>
                <Column style={valueCol}>
                  <Text style={value}>{orderDate}</Text>
                </Column>
              </Row>
            </Section>

            {fileUrl && (
              <Section style={downloadBox}>
                <Text style={downloadLabel}>Din nedlasting er klar</Text>
                <a href={fileUrl} style={downloadBtn}>
                  Last ned PDF →
                </a>
                <Text style={downloadNote}>
                  Linken fungerer alltid — du kan laste ned igjen når som helst.
                </Text>
              </Section>
            )}

            <Text style={warmText}>
              Tusen takk! Jeg håper du finner god nytte av dette. Ta gjerne kontakt om det er noe på{" "}
              <a href="mailto:hei@milenabua.no" style={link}>hei@milenabua.no</a>
            </Text>

            <Text style={text}>
              Det du kjøper her er med på å finansiere nye prosjekter jeg bygger og teknologi jeg vil
              utforske videre — det setter jeg stor pris på!
            </Text>

            <Text style={signoff}>
              Varm hilsen,<br />
              Milena
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section>
            <Text style={footer}>
              © {new Date().getFullYear()} Milena Bua · milenabua.no
            </Text>
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
  maxWidth: "560px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden" as const,
  border: "1px solid #e8e6e1",
};

const header = {
  backgroundColor: "#1a1a2e",
  padding: "24px 40px",
};

const logo = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "800",
  margin: "0",
  letterSpacing: "-0.5px",
};

const content = {
  padding: "36px 40px 24px",
};

const h1 = {
  color: "#1a1a2e",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 16px",
  letterSpacing: "-0.5px",
};

const text = {
  color: "#666560",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 20px",
};

const orderBox = {
  backgroundColor: "#f9f8f6",
  borderRadius: "8px",
  padding: "4px 20px",
  margin: "24px 0",
  border: "1px solid #e8e6e1",
};

const labelCol = { width: "40%" };
const valueCol = { width: "60%" };

const label = {
  color: "#999896",
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "12px 0",
};

const value = {
  color: "#1a1a2e",
  fontSize: "15px",
  fontWeight: "600",
  margin: "12px 0",
};

const divider = {
  borderColor: "#e8e6e1",
  margin: "0",
};

const link = {
  color: "#3b6fd4",
  textDecoration: "none",
};

const footerDivider = {
  borderColor: "#e8e6e1",
  margin: "0 40px",
};

const downloadBox = {
  backgroundColor: "#eef2fb",
  borderRadius: "10px",
  padding: "20px 24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const downloadLabel = {
  color: "#1a1a2e",
  fontSize: "15px",
  fontWeight: "700",
  margin: "0 0 14px",
};

const downloadBtn = {
  display: "inline-block",
  backgroundColor: "#4F46E5",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "700",
  padding: "12px 28px",
  borderRadius: "999px",
  textDecoration: "none",
};

const downloadNote = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "12px 0 0",
};

const warmText = {
  color: "#1a1a2e",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "24px 0 16px",
  fontWeight: "500",
};

const signoff = {
  color: "#1a1a2e",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "20px 0 8px",
  fontWeight: "600",
};

const footer = {
  color: "#b8b6b0",
  fontSize: "12px",
  textAlign: "center" as const,
  padding: "20px 40px",
  margin: "0",
};
