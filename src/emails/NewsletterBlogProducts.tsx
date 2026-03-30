import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";

export interface BlogPostItem {
  slug: string;
  title: string;
  excerpt?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
}

interface Props {
  subject: string;
  content: string;
  unsubscribeUrl: string;
  recipientName?: string;
  posts?: BlogPostItem[];
  products?: ProductItem[];
}

const SITE = "https://www.milenabua.no";

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

export default function NewsletterBlogProducts({
  subject = "Nyhetsbrev fra Milena Bua",
  content = "",
  unsubscribeUrl = `${SITE}/api/unsubscribe?email=test`,
  recipientName,
  posts = [],
  products = [],
}: Props) {
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
          <Section style={contentSection}>
            {recipientName && (
              <Text style={greeting}>Hei {recipientName}!</Text>
            )}
            {renderContent(content)}
          </Section>

          {/* Blog posts */}
          {posts.length > 0 && (
            <Section style={cardsSection}>
              <Text style={sectionLabel}>Fra bloggen</Text>
              {posts.map((post) => (
                <div key={post.slug} style={card}>
                  <Text style={cardTitle}>{post.title}</Text>
                  {post.excerpt && (
                    <Text style={cardExcerpt}>{post.excerpt}</Text>
                  )}
                  <Link
                    href={`${SITE}/blogg/${post.slug}`}
                    style={cardLink}
                  >
                    Les innlegget →
                  </Link>
                </div>
              ))}
            </Section>
          )}

          {/* Products */}
          {products.length > 0 && (
            <Section style={cardsSection}>
              <Text style={sectionLabel}>Produkter</Text>
              {products.map((product) => (
                <div key={product.id} style={productCard}>
                  <div>
                    <Text style={cardTitle}>{product.name}</Text>
                    <Text style={cardExcerpt}>{product.price} kr</Text>
                  </div>
                  <Link
                    href={`${SITE}/produkter/${product.id}`}
                    style={productBtn}
                  >
                    Kjøp →
                  </Link>
                </div>
              ))}
            </Section>
          )}

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section style={footerSection}>
            <Text style={footer}>
              Du mottar denne e-posten fordi du har kjøpt et produkt eller
              meldt deg på nyhetsbrev fra milenabua.no.{" "}
              <a href={unsubscribeUrl} style={unsubLink}>
                Meld deg av her
              </a>
              .
            </Text>
            <Text style={footer}>
              © {new Date().getFullYear()} Milena Bua · milenabua.no
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
  maxWidth: "580px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden" as const,
  border: "1px solid #e8e6e1",
};

const header = { backgroundColor: "#1a1a2e", padding: "24px 40px" };

const logo = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "800",
  margin: "0",
  letterSpacing: "-0.5px",
};

const contentSection = { padding: "36px 40px 8px" };

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

const cardsSection = { padding: "8px 40px 8px" };

const sectionLabel = {
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "0.07em",
  color: "#6b7280",
  margin: "0 0 12px",
};

const card: React.CSSProperties = {
  border: "1px solid #e8e6e1",
  borderRadius: "8px",
  padding: "16px 20px",
  marginBottom: "10px",
};

const productCard: React.CSSProperties = {
  border: "1px solid #e8e6e1",
  borderRadius: "8px",
  padding: "16px 20px",
  marginBottom: "10px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const cardTitle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#1a1a2e",
  margin: "0 0 6px",
};

const cardExcerpt = {
  fontSize: "13px",
  color: "#6b7280",
  lineHeight: "1.5",
  margin: "0 0 10px",
};

const cardLink = {
  fontSize: "13px",
  color: "#3b6fd4",
  fontWeight: "600",
  textDecoration: "none",
};

const productBtn: React.CSSProperties = {
  backgroundColor: "#1a1a2e",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "600",
  padding: "8px 16px",
  borderRadius: "6px",
  textDecoration: "none",
};

const footerDivider = { borderColor: "#e8e6e1", margin: "16px 40px 0" };

const footerSection = { padding: "20px 40px" };

const footer = {
  color: "#b0aead",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0 0 4px",
  textAlign: "center" as const,
};

const unsubLink = { color: "#b0aead", textDecoration: "underline" };
