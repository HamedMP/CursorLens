export interface AIConfiguration {
  id: string;
  name: string;
  provider: string;
  model: string;
  temperature: number | null;
  maxTokens: number | null;
  topP: number | null;
  frequencyPenalty: number | null;
  presencePenalty: number | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  apiKey: string | null;
  cost?: {
    inputTokenCost: number;
    outputTokenCost: number;
    validFrom: Date;
  };
}

export interface ModelConfigurations {
  [provider: string]: {
    [model: string]: {
      name?: string;
      isTemplate?: boolean;
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
    };
  };
}
