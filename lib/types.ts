export interface AdConcept {
  name: string;
  angle: string;
  awareness_level: string;
  text_overlay: {
    qualifier: string;
    headline: string;
    subhead: string;
    context_line: string;
  };
  style: {
    headline_accent_words: string[];
    subhead_color: 'gray' | 'yellow' | 'white';
    background_type: 'warm_spotlight' | 'gradient' | 'solid';
    background_primary: string;
    background_secondary?: string;
    qualifier_bg: 'red' | 'dark';
  };
  gemini_json: GeminiPrompt;
}

export interface GeminiPrompt {
  prompt: string;
  dimensions: {
    width: number;
    height: number;
    aspect_ratio: string;
  };
  text_elements: GeminiTextElement[];
  background: {
    type: string;
    primary_color: string;
    secondary_color?: string;
    description: string;
  };
  constraints: string[];
}

export interface GeminiTextElement {
  type: string;
  text: string;
  style: Record<string, unknown>;
  position: string;
}

export interface GenerateRequest {
  angleFocus?: string;
  proofPoints?: string;
  conceptCount?: number;
}
