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
  imageUrl: string;
  gallery?: string[]; // Array av bildeurlater
  category: string;
  
  // Status: draft | scheduled | published | hidden
  status: "draft" | "scheduled" | "published" | "hidden";
  
  // Publisering og synlighet
  publishDate: string; // YYYY-MM-DD
  publishTime?: string; // HH:mm format
  visible: boolean; // Manuell skjuling av publisert innlegg
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  // Tracking
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  gallery?: string[];
  category: string;
  inStock: boolean;
  type: "pdf" | "physical" | "regneark";
  buyUrl?: string;
  pageContent?: string;
  visible?: boolean;
  file_url?: string;
}
