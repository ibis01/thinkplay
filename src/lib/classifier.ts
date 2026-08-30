import { PromptCategory } from '@/types';

export function classifyPrompt(text: string): PromptCategory {
  const lower = text.toLowerCase();
  const codingKeywords = ['code', 'javascript', 'python', 'bug', 'debug', 'api', 'react', 'function', 'css', 'html'];
  const creativeKeywords = ['write', 'story', 'poem', 'image', 'design', 'logo', 'art', 'draw', 'paint', 'creative'];
  
  if (codingKeywords.some(keyword => lower.includes(keyword))) return "coding";
  if (creativeKeywords.some(keyword => lower.includes(keyword))) return "creative";
  return "general";
}
