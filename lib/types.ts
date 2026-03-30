export interface AdConcept {
  name: string;
  angle: string;
  awareness_level: string;
  text_overlay: {
    headline: string;
    subhead: string;
    cta_badge: string;
    proof_element: string;
  };
  style: {
    headline_accent_words: string[];
    background_type: 'solid' | 'gradient' | 'texture';
    background_primary: string;
    background_secondary?: string;
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
