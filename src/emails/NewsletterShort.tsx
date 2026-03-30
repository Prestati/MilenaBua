import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface Props {
  subject: string;
  content: string;
  unsubscribeUrl: string;
  recipientName?: string;
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

function renderContent(text: string) {
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

export default function NewsletterShort({
  subject = "En liten oppdatering",
  content = "",
  unsubscribeUrl = "https://www.milenabua.no/api/unsubscribe?email=test",
  recipientName,
}: Props) {
  return (
    <Html lang="no">
      <Head />
      <Preview>{subject}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Minimal header */}
          <Section style={topSection}>
            <Text style={logoText}>Milena Bua</Text>
          </Section>

          <Hr style={divider} />

          {/* Content */}
          <Section style={contentSection}>
            {recipientName && (
              <Text style={greeting}>Hei {recipientName}!</Text>
            )}
            {renderContent(content)}
          </Section>

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section style={footerSection}>
            <Text style={footer}>
              <a href={unsubscribeUrl} style={unsubLink}>
                Meld deg av
              </a>{" "}
              · milenabua.no · © {new Date().getFullYear()} Milena Bua
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

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

const topSection = { padding: "28px 40px 20px" };

const logoText = {
  fontSize: "14px",
  fontWeight: "800",
  color: "#1a1a2e",
  letterSpacing: "-0.3px",
  margin: "0",
};

const divider = { borderColor: "#e8e6e1", margin: "0 40px" };

const contentSection = { padding: "28px 40px 24px" };

const greeting = {
  color: "#1a1a2e",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const bodyText = {
  color: "#444240",
  fontSize: "15px",
  lineHeight: "1.75",
  margin: "0 0 16px",
};

const footerDivider = { borderColor: "#e8e6e1", margin: "0 40px" };

const footerSection = { padding: "16px 40px" };

const footer = {
  color: "#b0aead",
  fontSize: "11px",
  lineHeight: "1.6",
  margin: "0",
  textAlign: "center" as const,
};

const unsubLink = { color: "#b0aead", textDecoration: "underline" };
