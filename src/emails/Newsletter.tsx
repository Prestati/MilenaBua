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

interface NewsletterProps {
  subject: string;
  content: string;
  unsubscribeUrl: string;
  recipientName?: string;
}

/** Parses inline **bold** and *italic* markdown */
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
      const nodes = lines.flatMap((line, j) => [
        ...parseInline(line),
        j < lines.length - 1 ? <br key={`br-${j}`} /> : null,
      ]).filter(Boolean);
      return <Text key={i} style={bodyText}>{nodes}</Text>;
    });
}

export default function Newsletter({
  subject = "Nyhetsbrev fra Milena Bua",
  content = "Innhold her.",
  unsubscribeUrl = "https://www.milenabua.no/api/unsubscribe?email=test",
  recipientName,
}: NewsletterProps) {
  return (
    <Html lang="no">
      <Head />
      <Preview>{subject}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={logo}>Milena Bua</Text>
          </Section>

          {/* Content */}
          <Section style={contentStyle}>
            {recipientName && (
              <Text style={greeting}>Hei {recipientName}!</Text>
            )}
            {renderContent(content)}
          </Section>

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section style={footerSection}>
            <Text style={footer}>
              Du mottar denne e-posten fordi du har kjøpt et produkt eller meldt deg på nyhetsbrev
              fra milenabua.no.{" "}
              <a href={unsubscribeUrl} style={unsubLink}>
                Meld deg av her
              </a>
              .
            </Text>
            <Text style={footer}>© {new Date().getFullYear()} Milena Bua · milenabua.no</Text>
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
  maxWidth: "580px",
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

const contentStyle = {
  padding: "36px 40px 24px",
};

const greeting = {
  color: "#1a1a2e",
  fontSize: "17px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const bodyText = {
  color: "#444240",
  fontSize: "15px",
  lineHeight: "1.75",
  margin: "0 0 16px",
};

const footerDivider = {
  borderColor: "#e8e6e1",
  margin: "0 40px",
};

const footerSection = {
  padding: "20px 40px",
};

const footer = {
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
