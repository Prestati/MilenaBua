export interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  liveUrl?: string;
  githubUrl?: string;
  content: string;
  emoji?: string;
  subtitle?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
  content: string;
  imageUrl?: string;
  category?: string;
  published?: boolean;
  publishDate?: string;
  visible?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
  type: "pdf" | "physical";
  buyUrl?: string;
  pageContent?: string;
}
