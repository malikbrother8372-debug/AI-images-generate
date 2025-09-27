
export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string | null;
  status: 'pending' | 'generating' | 'success' | 'error';
  error?: string;
}
