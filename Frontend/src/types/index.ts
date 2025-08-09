export interface Document {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  slides: any[];
}

export interface SlideTemplate {
  id: number;
  name: string;
  icon: string;
  templateKey: string;
  fields: any[];
} 