import {
  Body,
  Container,
  Head,
  Html,
  Img,
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
  headerImageUrl?: string;
  trackingPixelUrl?: string;
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

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function renderContent(text: string) {
  return text
    .split(/\n\n+/)
    .filter(Boolean)
    .map((para, i) => {
      const trimmed = para.trim();
      const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imgMatch) {
        return (
          <Section key={i} style={{ margin: "16px 0" }}>
            <Img src={imgMatch[2]} alt={imgMatch[1] || ""} width="500"
              style={{ display: "block", width: "100%", maxWidth: "500px", borderRadius: "8px" }} />
          </Section>
        );
      }
      const ytId = getYouTubeId(trimmed);
      if (ytId) {
        return (
          <Section key={i} style={{ margin: "16px 0", textAlign: "center" }}>
            <a href={trimmed} style={{ display: "block", textDecoration: "none" }}>
              <Img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="Se video" width="500"
                style={{ display: "block", width: "100%", maxWidth: "500px", borderRadius: "8px", border: "3px solid #e8e6e1" }} />
              <Text style={{ color: "#3b6fd4", fontWeight: "700", fontSize: "14px", margin: "8px 0 0" }}>▶ Se video på YouTube</Text>
            </a>
          </Section>
        );
      }
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
  headerImageUrl,
  trackingPixelUrl,
}: Props) {
  return (
    <Html lang="no">
      <Head />
      <Preview>{subject}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Optional header image */}
          {headerImageUrl && (
            <Img src={headerImageUrl} alt="" width="580"
              style={{ display: "block", width: "100%", maxWidth: "580px", borderRadius: "12px 12px 0 0" }} />
          )}
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

          {/* Tracking pixel */}
          {trackingPixelUrl && (
            <Img src={trackingPixelUrl} width="1" height="1" alt="" style={{ display: "block", width: "1px", height: "1px", border: "none" }} />
          )}
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
