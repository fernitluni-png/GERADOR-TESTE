export type ScriptSource = "ai" | "template" | "custom";

export interface SavedScript {
  id: string;
  name: string;
  description: string;
  code: string;
  overlay: boolean;
  icon: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  source: ScriptSource;
  isFavorite?: boolean;
}

export interface QCSTemplate {
  id: string;
  title: string;
  description: string;
  category: "trend" | "reversal" | "orderflow" | "volatility" | "oscillator";
  difficulty: "Iniciante" | "Intermediário" | "Avançado";
  overlay: boolean;
  icon: string;
  tags: string[];
  code: string;
  howToUse: string;
}

export interface ScriptInputMeta {
  name: string;
  type: string;
  default: string | number | boolean;
  description: string;
}

export interface AIGeneratedData {
  name: string;
  overlay: boolean;
  icon: string;
  script: string;
  description: string;
  howToTrade: string;
  keyFeatures: string[];
  inputsList?: ScriptInputMeta[];
}

export interface QCSValidationMessage {
  type: "error" | "warning" | "info" | "success";
  message: string;
  line?: number;
  suggestion?: string;
  fixable?: boolean;
}

export interface QCSValidationResult {
  isValid: boolean;
  hasOverlay: boolean;
  overlayType?: boolean;
  instrumentName?: string;
  messages: QCSValidationMessage[];
}
