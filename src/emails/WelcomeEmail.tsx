import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface WelcomeEmailProps {
  recipientName?: string;
  subject?: string;
  body?: string;
  pdfUrl?: string;
  pdfButtonText?: string;
  unsubscribeUrl?: string;
}

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function renderBody(text: string) {
  return text
    .split(/\n\n+/)
    .filter(Boolean)
    .map((para, i) => {
      const lines = para.split("\n");
      const nodes = lines
        .flatMap((line, j) => [
          ...parseInline(line),
          j < lines.length - 1 ? <br key={`br-${j}`} /> : null,
        ])
        .filter(Boolean);
      return (
        <Text key={i} style={bodyText}>
          {nodes}
        </Text>
      );
    });
}

export default function WelcomeEmail({
  recipientName,
  subject = "Velkommen — her er gaven din!",
  body = "Tusen takk for at du meldte deg på! Jeg gleder meg til å dele verktøy, erfaringer og ærlige oppdateringer fra eksperimentet mitt med deg.",
  pdfUrl,
  pdfButtonText = "Last ned gratis PDF →",
  unsubscribeUrl = "https://www.milenabua.no/api/unsubscribe?email=test",
}: WelcomeEmailProps) {
  const firstName = recipientName?.split(" ")[0];

  return (
    <Html lang="no">
      <Head />
      <Preview>{subject}</Preview>
      <Body style={bodyStyle}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={logo}>Milena Bua</Text>
            <Text style={tagline}>4 timer om dagen er nok til å bygge noe du er stolt av</Text>
          </Section>

          {/* Content */}
          <Section style={contentSection}>
            <Text style={greeting}>
              Hei{firstName ? ` ${firstName}` : ""}! 👋
            </Text>

            {renderBody(body)}

            {/* Download button */}
            {pdfUrl && (
              <Section style={ctaSection}>
                <Button href={pdfUrl} style={ctaButton}>
                  {pdfButtonText}
                </Button>
                <Text style={ctaHint}>
                  Knappen tar deg direkte til nedlastingen. Lagre den gjerne!
                </Text>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footerSection}>
            <Text style={footerText}>
              Du mottar denne e-posten fordi du meldte deg på nyhetsbrevet fra milenabua.no.{" "}
              <a href={unsubscribeUrl} style={unsubLink}>
                Meld deg av her
              </a>
              .
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Milena Bua · milenabua.no
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: "#f5f4f2",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container = {
  maxWidth: "580px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden" as const,
  border: "1px solid #e8e6e1",
};

const header = {
  backgroundColor: "#1a1a2e",
  padding: "28px 40px",
};

const logo = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "800",
  margin: "0 0 4px",
  letterSpacing: "-0.5px",
};

const tagline = {
  color: "rgba(255,255,255,0.5)",
  fontSize: "12px",
  margin: "0",
  lineHeight: "1.4",
};

const contentSection = {
  padding: "36px 40px 24px",
};

const greeting = {
  color: "#1a1a2e",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0 0 20px",
};

const bodyText = {
  color: "#444240",
  fontSize: "15px",
  lineHeight: "1.8",
  margin: "0 0 16px",
};

const ctaSection = {
  margin: "28px 0 8px",
  textAlign: "center" as const,
};

const ctaButton = {
  backgroundColor: "#3b6fd4",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "700",
  padding: "14px 32px",
  borderRadius: "999px",
  textDecoration: "none",
  display: "inline-block",
};

const ctaHint = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "12px 0 0",
  textAlign: "center" as const,
};

const divider = {
  borderColor: "#e8e6e1",
  margin: "0 40px",
};

const footerSection = {
  padding: "20px 40px",
};

const footerText = {
  color: "#b0aead",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0 0 4px",
  textAlign: "center" as const,
};

const unsubLink = {
  color: "#b0aead",
  textDecoration: "underline",
};
