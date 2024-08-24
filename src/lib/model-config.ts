type ModelConfig = {
  name?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  inputTokenCost: number; // price per million tokens
  outputTokenCost: number; // price per million tokens
  isTemplate: boolean;
};

type ProviderConfigs = {
  [key: string]: ModelConfig | null;
};

export type ModelConfigurations = {
  [key: string]: ProviderConfigs;
};

export const getModelConfigurations = (): ModelConfigurations => ({
  openai: {
    "gpt-4o": {
      name: "OpenAI GPT-4 Optimized",
      temperature: 0.7,
      maxTokens: 8192,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      inputTokenCost: 5, // updated to price per million tokens
      outputTokenCost: 15, // updated to price per million tokens
      isTemplate: true,
    },
    "gpt-4o-mini": {
      name: "OpenAI GPT-4 Mini",
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      inputTokenCost: 0.15, // updated to price per million tokens
      outputTokenCost: 0.6, // updated to price per million tokens
      isTemplate: true,
    },
    "gpt-4-turbo": {
      name: "OpenAI GPT-4",
      temperature: 0.7,
      maxTokens: 8192,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      inputTokenCost: 10, // updated to price per million tokens
      outputTokenCost: 30, // updated to price per million tokens
      isTemplate: true,
    },
    "gpt-4o-2024-08-06": {
      name: "GPT-4 Optimized (2024-08-06)",
      inputTokenCost: 2.5, // updated to price per million tokens
      outputTokenCost: 10, // updated to price per million tokens
      isTemplate: false,
    },
    "gpt-3.5-turbo-0125": {
      inputTokenCost: 0.5, // updated to price per million tokens
      outputTokenCost: 1.5, // updated to price per million tokens
      isTemplate: false,
    },
    "chatgpt-4o-latest": {
      inputTokenCost: 5, // updated to price per million tokens
      outputTokenCost: 15, // updated to price per million tokens
      isTemplate: false,
    },
    "gpt-4-turbo-2024-04-09": {
      inputTokenCost: 10, // updated to price per million tokens
      outputTokenCost: 30, // updated to price per million tokens
      isTemplate: false,
    },
    "gpt-4": {
      inputTokenCost: 30, // updated to price per million tokens
      outputTokenCost: 60, // updated to price per million tokens
      isTemplate: false,
    },
    "gpt-4-32k": {
      inputTokenCost: 60, // updated to price per million tokens
      outputTokenCost: 120, // updated to price per million tokens
      isTemplate: false,
    },
    "gpt-4-0125-preview": {
      inputTokenCost: 10, // updated to price per million tokens
      outputTokenCost: 30, // updated to price per million tokens
      isTemplate: false,
    },
    "gpt-4-1106-preview": {
      inputTokenCost: 10, // updated to price per million tokens
      outputTokenCost: 30, // updated to price per million tokens
      isTemplate: false,
    },
    "gpt-4-vision-preview": {
      inputTokenCost: 10, // updated to price per million tokens
      outputTokenCost: 30, // updated to price per million tokens
      isTemplate: false,
    },
    "gpt-3.5-turbo-instruct": {
      inputTokenCost: 1.5, // updated to price per million tokens
      outputTokenCost: 2, // updated to price per million tokens
      isTemplate: false,
    },
    "gpt-3.5-turbo-1106": {
      inputTokenCost: 1, // updated to price per million tokens
      outputTokenCost: 2, // updated to price per million tokens
      isTemplate: false,
    },
    "gpt-3.5-turbo-0613": {
      inputTokenCost: 1.5, // updated to price per million tokens
      outputTokenCost: 2, // updated to price per million tokens
      isTemplate: false,
    },
    "gpt-3.5-turbo-16k-0613": {
      inputTokenCost: 3, // updated to price per million tokens
      outputTokenCost: 4, // updated to price per million tokens
      isTemplate: false,
    },
    "gpt-3.5-turbo-0301": {
      inputTokenCost: 1.5, // updated to price per million tokens
      outputTokenCost: 2, // updated to price per million tokens
      isTemplate: false,
    },
    "davinci-002": {
      inputTokenCost: 2, // updated to price per million tokens
      outputTokenCost: 2, // updated to price per million tokens
      isTemplate: false,
    },
    "babbage-002": {
      inputTokenCost: 0.4, // updated to price per million tokens
      outputTokenCost: 0.4, // updated to price per million tokens
      isTemplate: false,
    },
  },
  anthropicCached: {
    "claude-3-5-sonnet-20240620": {
      name: "Anthropic Claude 3.5 Sonnet (Cached)",
      temperature: 0.7,
      maxTokens: 200000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      inputTokenCost: 3, // updated to price per million tokens
      outputTokenCost: 15, // updated to price per million tokens
      isTemplate: true,
    },
  },
  anthropic: {
    "claude-3-5-sonnet-20240620": {
      name: "Anthropic Claude 3.5 Sonnet",
      temperature: 0.7,
      maxTokens: 200000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      inputTokenCost: 3, // updated to price per million tokens
      outputTokenCost: 15, // updated to price per million tokens
      isTemplate: true,
    },
    "claude-3-opus-20240229": null,
    "claude-3-sonnet-20240229": null,
    "claude-3-haiku-20240307": null,
    "claude-3-5-sonnet": {
      inputTokenCost: 3, // updated to price per million tokens
      outputTokenCost: 15, // updated to price per million tokens
      isTemplate: false,
    },
    "claude-3-opus": {
      inputTokenCost: 15, // updated to price per million tokens
      outputTokenCost: 75, // updated to price per million tokens
      isTemplate: false,
    },
    "claude-3-haiku": {
      inputTokenCost: 0.25, // updated to price per million tokens
      outputTokenCost: 1.25, // updated to price per million tokens
      isTemplate: false,
    },
    "claude-2-1": {
      inputTokenCost: 8, // updated to price per million tokens
      outputTokenCost: 24, // updated to price per million tokens
      isTemplate: false,
    },
    "claude-2-0": {
      inputTokenCost: 8, // updated to price per million tokens
      outputTokenCost: 24, // updated to price per million tokens
      isTemplate: false,
    },
    "claude-instant": {
      inputTokenCost: 0.8, // updated to price per million tokens
      outputTokenCost: 2.4, // updated to price per million tokens
      isTemplate: false,
    },
  },
  cohere: {
    "command-r": null,
    "command-r-plus": null,
  },
  mistral: {
    "mistral-large-latest": {
      name: "Mistral Large",
      temperature: 0.7,
      maxTokens: 32768,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: true,
    },
    "mistral-medium-latest": null,
    "mistral-small-latest": null,
    "open-mistral-nemo": null,
    "open-mixtral-8x22b": null,
    "open-mixtral-8x7b": null,
    "open-mistral-7b": null,
  },
  groq: {
    "llama-3.1-70b-versatile": {
      name: "Groq LLaMA 3.1",
      temperature: 0.7,
      maxTokens: 32768,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: true,
    },
    "llama-3.1-405b-reasoning": null,
    "llama-3.1-8b-instant": null,
    "mixtral-8x7b-32768": null,
    "gemma2-9b-it": null,
  },
  ollama: {
    codegemma: null,
    "codegemma:2b": null,
    "codegemma:7b": null,
    codellama: null,
    "codellama:7b": null,
    "codellama:13b": null,
    "codellama:34b": null,
    "codellama:70b": null,
    "codellama:code": null,
    "codellama:python": null,
    "command-r": null,
    "command-r:35b": null,
    "command-r-plus": null,
    "command-r-plus:104b": null,
    "deepseek-coder-v2": null,
    "deepseek-coder-v2:16b": null,
    "deepseek-coder-v2:236b": null,
    falcon2: null,
    "falcon2:11b": null,
    gemma: null,
    "gemma:2b": null,
    "gemma:7b": null,
    gemma2: null,
    "gemma2:2b": null,
    "gemma2:9b": null,
    "gemma2:27b": null,
    llama2: null,
    "llama2:7b": null,
    "llama2:13b": null,
    "llama2:70b": null,
    llama3: null,
    "llama3:8b": null,
    "llama3:70b": null,
    "llama3-chatqa": null,
    "llama3-chatqa:8b": null,
    "llama3-chatqa:70b": null,
    "llama3-gradient": null,
    "llama3-gradient:8b": null,
    "llama3-gradient:70b": null,
    "llama3.1": null,
    "llama3.1:8b": null,
    "llama3.1:70b": null,
    "llama3.1:405b": null,
    llava: null,
    "llava:7b": null,
    "llava:13b": null,
    "llava:34b": null,
    "llava-llama3": null,
    "llava-llama3:8b": null,
    "llava-phi3": null,
    "llava-phi3:3.8b": null,
    mistral: null,
    "mistral:7b": null,
    "mistral-large": null,
    "mistral-large:123b": null,
    "mistral-nemo": null,
    "mistral-nemo:12b": null,
    mixtral: null,
    "mixtral:8x7b": null,
    "mixtral:8x22b": null,
    moondream: null,
    "moondream:1.8b": null,
    openhermes: null,
    "openhermes:v2.5": null,
    qwen: null,
    "qwen:7b": null,
    "qwen:14b": null,
    "qwen:32b": null,
    "qwen:72b": null,
    "qwen:110b": null,
    qwen2: null,
    "qwen2:0.5b": null,
    "qwen2:1.5b": null,
    "qwen2:7b": null,
    "qwen2:72b": null,
    phi3: null,
    "phi3:3.8b": null,
    "phi3:14b": null,
  },
  openrouter: {
    "01-ai/yi-large": {
      inputTokenCost: 3,
      outputTokenCost: 3,
      isTemplate: false,
    },
    "01-ai/yi-large-fc": {
      inputTokenCost: 3,
      outputTokenCost: 3,
      isTemplate: false,
    },
    "01-ai/yi-large-turbo": {
      inputTokenCost: 0.19,
      outputTokenCost: 0.19,
      isTemplate: false,
    },
    "01-ai/yi-34b": {
      inputTokenCost: 0.72,
      outputTokenCost: 0.72,
      isTemplate: false,
    },
    "01-ai/yi-34b-chat": {
      inputTokenCost: 0.72,
      outputTokenCost: 0.72,
      isTemplate: false,
    },
    "01-ai/yi-6b": {
      inputTokenCost: 0.18,
      outputTokenCost: 0.18,
      isTemplate: false,
    },
    "01-ai/yi-vision": {
      inputTokenCost: 0.19,
      outputTokenCost: 0.19,
      isTemplate: false,
    },
    "aetherwiing/mn-starcannon-12b": {
      inputTokenCost: 2,
      outputTokenCost: 2,
      isTemplate: false,
    },
    "ai21/jamba-instruct": {
      inputTokenCost: 0.5,
      outputTokenCost: 0.7,
      isTemplate: false,
    },
    "allenai/olmo-7b-instruct": {
      inputTokenCost: 0.18,
      outputTokenCost: 0.18,
      isTemplate: false,
    },
    "alpindale/goliath-120b": {
      inputTokenCost: 9.375,
      outputTokenCost: 9.375,
      isTemplate: false,
    },
    "alpindale/magnum-72b": {
      inputTokenCost: 3.75,
      outputTokenCost: 4.5,
      isTemplate: false,
    },
    "anthropic/claude-1": {
      inputTokenCost: 8,
      outputTokenCost: 24,
      isTemplate: false,
    },
    "anthropic/claude-1.2": {
      inputTokenCost: 8,
      outputTokenCost: 24,
      isTemplate: false,
    },
    "anthropic/claude-2": {
      inputTokenCost: 8,
      outputTokenCost: 24,
      isTemplate: false,
    },
    "anthropic/claude-2:beta": {
      inputTokenCost: 8,
      outputTokenCost: 24,
      isTemplate: false,
    },
    "anthropic/claude-2.0": {
      inputTokenCost: 8,
      outputTokenCost: 24,
      isTemplate: false,
    },
    "anthropic/claude-2.0:beta": {
      inputTokenCost: 8,
      outputTokenCost: 24,
      isTemplate: false,
    },
    "anthropic/claude-2.1": {
      inputTokenCost: 8,
      outputTokenCost: 24,
      isTemplate: false,
    },
    "anthropic/claude-2.1:beta": {
      inputTokenCost: 8,
      outputTokenCost: 24,
      isTemplate: false,
    },
    "anthropic/claude-3-haiku": {
      inputTokenCost: 0.25,
      outputTokenCost: 1.25,
      isTemplate: false,
    },
    "anthropic/claude-3-haiku:beta": {
      inputTokenCost: 0.25,
      outputTokenCost: 1.25,
      isTemplate: false,
    },
    "anthropic/claude-3-opus": {
      inputTokenCost: 15,
      outputTokenCost: 75,
      isTemplate: false,
    },
    "anthropic/claude-3-opus:beta": {
      inputTokenCost: 15,
      outputTokenCost: 75,
      isTemplate: false,
    },
    "anthropic/claude-3-sonnet": {
      inputTokenCost: 3,
      outputTokenCost: 15,
      isTemplate: false,
    },
    "anthropic/claude-3.5-sonnet": {
      inputTokenCost: 3,
      outputTokenCost: 15,
      isTemplate: false,
    },
    "anthropic/claude-3.5-sonnet:beta": {
      inputTokenCost: 3,
      outputTokenCost: 15,
      isTemplate: false,
    },
    "anthropic/claude-3-sonnet:beta": {
      inputTokenCost: 3,
      outputTokenCost: 15,
      isTemplate: false,
    },
    "anthropic/claude-instant-1": {
      inputTokenCost: 0.8,
      outputTokenCost: 2.4,
      isTemplate: false,
    },
    "anthropic/claude-instant-1:beta": {
      inputTokenCost: 0.8,
      outputTokenCost: 2.4,
      isTemplate: false,
    },
    "anthropic/claude-instant-1.0": {
      inputTokenCost: 0.8,
      outputTokenCost: 2.4,
      isTemplate: false,
    },
    "anthropic/claude-instant-1.1": {
      inputTokenCost: 0.8,
      outputTokenCost: 2.4,
      isTemplate: false,
    },
    "austism/chronos-hermes-13b": {
      inputTokenCost: 0.13,
      outputTokenCost: 0.13,
      isTemplate: false,
    },
    "cohere/command": {
      inputTokenCost: 1,
      outputTokenCost: 2,
      isTemplate: false,
    },
    "cohere/command-r": {
      inputTokenCost: 0.5,
      outputTokenCost: 1.5,
      isTemplate: false,
    },
    "cohere/command-r-plus": {
      inputTokenCost: 3,
      outputTokenCost: 15,
      isTemplate: false,
    },
    "cognitivecomputations/dolphin-llama-3-70b": {
      inputTokenCost: 0.35,
      outputTokenCost: 0.4,
      isTemplate: false,
    },
    "cognitivecomputations/dolphin-mixtral-8x22b": {
      inputTokenCost: 0.9,
      outputTokenCost: 0.9,
      isTemplate: false,
    },
    "cognitivecomputations/dolphin-mixtral-8x7b": {
      inputTokenCost: 0.5,
      outputTokenCost: 0.5,
      isTemplate: false,
    },
    "databricks/dbrx-instruct": {
      inputTokenCost: 1.08,
      outputTokenCost: 1.08,
      isTemplate: false,
    },
    "deepseek/deepseek-chat": {
      inputTokenCost: 0.14,
      outputTokenCost: 0.28,
      isTemplate: false,
    },
    "deepseek/deepseek-coder": {
      inputTokenCost: 0.14,
      outputTokenCost: 0.28,
      isTemplate: false,
    },
    "google/gemini-flash-1.5": {
      inputTokenCost: 0.0375,
      outputTokenCost: 0.15,
      isTemplate: false,
    },
    "google/gemini-pro": {
      inputTokenCost: 0.125,
      outputTokenCost: 0.375,
      isTemplate: false,
    },
    "google/gemini-pro-1.5": {
      inputTokenCost: 2.5,
      outputTokenCost: 7.5,
      isTemplate: false,
    },
    "google/gemini-pro-1.5-exp": {
      inputTokenCost: 2.5,
      outputTokenCost: 7.5,
      isTemplate: false,
    },
    "google/gemini-pro-vision": {
      inputTokenCost: 0.125,
      outputTokenCost: 0.375,
      isTemplate: false,
    },
    "google/gemma-2-27b-it": {
      inputTokenCost: 0.27,
      outputTokenCost: 0.27,
      isTemplate: false,
    },
    "google/gemma-2-9b-it": {
      inputTokenCost: 0.06,
      outputTokenCost: 0.06,
      isTemplate: false,
    },
    "google/gemma-2-9b-it:free": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "google/gemma-7b-it": {
      inputTokenCost: 0.07,
      outputTokenCost: 0.07,
      isTemplate: false,
    },
    "google/gemma-7b-it:free": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "google/gemma-7b-it:nitro": {
      inputTokenCost: 0.07,
      outputTokenCost: 0.07,
      isTemplate: false,
    },
    "google/palm-2-chat-bison": {
      inputTokenCost: 0.25,
      outputTokenCost: 0.5,
      isTemplate: false,
    },
    "google/palm-2-chat-bison-32k": {
      inputTokenCost: 0.25,
      outputTokenCost: 0.5,
      isTemplate: false,
    },
    "google/palm-2-codechat-bison": {
      inputTokenCost: 0.25,
      outputTokenCost: 0.5,
      isTemplate: false,
    },
    "google/palm-2-codechat-bison-32k": {
      inputTokenCost: 0.25,
      outputTokenCost: 0.5,
      isTemplate: false,
    },
    "gryphe/mythomist-7b": {
      inputTokenCost: 0.375,
      outputTokenCost: 0.375,
      isTemplate: false,
    },
    "gryphe/mythomist-7b:free": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "gryphe/mythomax-l2-13b": {
      inputTokenCost: 0.1,
      outputTokenCost: 0.1,
      isTemplate: false,
    },
    "huggingfaceh4/zephyr-7b-beta:free": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "jondurbin/airoboros-l2-70b": {
      inputTokenCost: 0.5,
      outputTokenCost: 0.5,
      isTemplate: false,
    },
    "lizpreciatior/lzlv-70b-fp16-hf": {
      inputTokenCost: 0.35,
      outputTokenCost: 0.4,
      isTemplate: false,
    },
    "mancer/weaver": {
      inputTokenCost: 1.875,
      outputTokenCost: 2.25,
      isTemplate: false,
    },
    "meta-llama/codellama-34b-instruct": {
      inputTokenCost: 0.72,
      outputTokenCost: 0.72,
      isTemplate: false,
    },
    "meta-llama/codellama-70b-instruct": {
      inputTokenCost: 0.81,
      outputTokenCost: 0.81,
      isTemplate: false,
    },
    "meta-llama/llama-3-70b": {
      inputTokenCost: 0.81,
      outputTokenCost: 0.81,
      isTemplate: false,
    },
    "meta-llama/llama-3-70b-instruct": {
      inputTokenCost: 0.35,
      outputTokenCost: 0.4,
      isTemplate: false,
    },
    "meta-llama/llama-3-70b-instruct:nitro": {
      inputTokenCost: 0.792,
      outputTokenCost: 0.792,
      isTemplate: false,
    },
    "meta-llama/llama-3-8b": {
      inputTokenCost: 0.18,
      outputTokenCost: 0.18,
      isTemplate: false,
    },
    "meta-llama/llama-3-8b-instruct": {
      inputTokenCost: 0.055,
      outputTokenCost: 0.055,
      isTemplate: false,
    },
    "meta-llama/llama-3-8b-instruct:extended": {
      inputTokenCost: 0.1875,
      outputTokenCost: 1.125,
      isTemplate: false,
    },
    "meta-llama/llama-3-8b-instruct:free": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "meta-llama/llama-3-8b-instruct:nitro": {
      inputTokenCost: 0.162,
      outputTokenCost: 0.162,
      isTemplate: false,
    },
    "meta-llama/llama-3.1-405b": {
      inputTokenCost: 2,
      outputTokenCost: 2,
      isTemplate: false,
    },
    "meta-llama/llama-3.1-405b-instruct": {
      inputTokenCost: 2.7,
      outputTokenCost: 2.7,
      isTemplate: false,
    },
    "meta-llama/llama-3.1-70b-instruct": {
      inputTokenCost: 0.35,
      outputTokenCost: 0.4,
      isTemplate: false,
    },
    "meta-llama/llama-3.1-8b-instruct": {
      inputTokenCost: 0.055,
      outputTokenCost: 0.055,
      isTemplate: false,
    },
    "meta-llama/llama-3.1-8b-instruct:free": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "meta-llama/llama-guard-2-8b": {
      inputTokenCost: 0.18,
      outputTokenCost: 0.18,
      isTemplate: false,
    },
    "microsoft/phi-3-medium-128k-instruct": {
      inputTokenCost: 1,
      outputTokenCost: 1,
      isTemplate: false,
    },
    "microsoft/phi-3-medium-128k-instruct:free": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "microsoft/phi-3-medium-4k-instruct": {
      inputTokenCost: 0.14,
      outputTokenCost: 0.14,
      isTemplate: false,
    },
    "microsoft/phi-3-mini-128k-instruct": {
      inputTokenCost: 0.1,
      outputTokenCost: 0.1,
      isTemplate: false,
    },
    "microsoft/phi-3-mini-128k-instruct:free": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "microsoft/wizardlm-2-7b": {
      inputTokenCost: 0.055,
      outputTokenCost: 0.055,
      isTemplate: false,
    },
    "microsoft/wizardlm-2-8x22b": {
      inputTokenCost: 0.5,
      outputTokenCost: 0.5,
      isTemplate: false,
    },
    "mistralai/codestral-mamba": {
      inputTokenCost: 0.25,
      outputTokenCost: 0.25,
      isTemplate: false,
    },
    "mistralai/mistral-7b-instruct": {
      inputTokenCost: 0.055,
      outputTokenCost: 0.055,
      isTemplate: false,
    },
    "mistralai/mistral-7b-instruct:free": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "mistralai/mistral-7b-instruct:nitro": {
      inputTokenCost: 0.07,
      outputTokenCost: 0.07,
      isTemplate: false,
    },
    "mistralai/mistral-7b-instruct-v0.1": {
      inputTokenCost: 0.055,
      outputTokenCost: 0.055,
      isTemplate: false,
    },
    "mistralai/mistral-7b-instruct-v0.2": {
      inputTokenCost: 0.055,
      outputTokenCost: 0.055,
      isTemplate: false,
    },
    "mistralai/mistral-7b-instruct-v0.3": {
      inputTokenCost: 0.055,
      outputTokenCost: 0.055,
      isTemplate: false,
    },
    "mistralai/mistral-large": {
      inputTokenCost: 3,
      outputTokenCost: 9,
      isTemplate: false,
    },
    "mistralai/mistral-medium": {
      inputTokenCost: 2.7,
      outputTokenCost: 8.1,
      isTemplate: false,
    },
    "mistralai/mistral-nemo": {
      inputTokenCost: 0.17,
      outputTokenCost: 0.17,
      isTemplate: false,
    },
    "mistralai/mistral-small": {
      inputTokenCost: 2,
      outputTokenCost: 6,
      isTemplate: false,
    },
    "mistralai/mistral-tiny": {
      inputTokenCost: 0.25,
      outputTokenCost: 0.25,
      isTemplate: false,
    },
    "mistralai/mixtral-8x22b": {
      inputTokenCost: 1.08,
      outputTokenCost: 1.08,
      isTemplate: false,
    },
    "mistralai/mixtral-8x22b-instruct": {
      inputTokenCost: 0.65,
      outputTokenCost: 0.65,
      isTemplate: false,
    },
    "mistralai/mixtral-8x7b": {
      inputTokenCost: 0.54,
      outputTokenCost: 0.54,
      isTemplate: false,
    },
    "mistralai/mixtral-8x7b-instruct": {
      inputTokenCost: 0.24,
      outputTokenCost: 0.24,
      isTemplate: false,
    },
    "mistralai/mixtral-8x7b-instruct:nitro": {
      inputTokenCost: 0.54,
      outputTokenCost: 0.54,
      isTemplate: false,
    },
    "neversleep/llama-3-lumimaid-70b": {
      inputTokenCost: 3.375,
      outputTokenCost: 4.5,
      isTemplate: false,
    },
    "neversleep/llama-3-lumimaid-8b": {
      inputTokenCost: 0.1875,
      outputTokenCost: 1.125,
      isTemplate: false,
    },
    "neversleep/llama-3-lumimaid-8b:extended": {
      inputTokenCost: 0.1875,
      outputTokenCost: 1.125,
      isTemplate: false,
    },
    "neversleep/noromaid-20b": {
      inputTokenCost: 1.5,
      outputTokenCost: 2.25,
      isTemplate: false,
    },
    "nousresearch/hermes-2-pro-llama-3-8b": {
      inputTokenCost: 0.14,
      outputTokenCost: 0.14,
      isTemplate: false,
    },
    "nousresearch/hermes-2-theta-llama-3-8b": {
      inputTokenCost: 0.1875,
      outputTokenCost: 1.125,
      isTemplate: false,
    },
    "nousresearch/hermes-3-llama-3.1-405b": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "nousresearch/hermes-3-llama-3.1-405b:extended": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "nousresearch/nous-capybara-7b": {
      inputTokenCost: 0.18,
      outputTokenCost: 0.18,
      isTemplate: false,
    },
    "nousresearch/nous-capybara-7b:free": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo": {
      inputTokenCost: 0.45,
      outputTokenCost: 0.45,
      isTemplate: false,
    },
    "nousresearch/nous-hermes-2-mixtral-8x7b-sft": {
      inputTokenCost: 0.54,
      outputTokenCost: 0.54,
      isTemplate: false,
    },
    "nousresearch/nous-hermes-2-mistral-7b-dpo": {
      inputTokenCost: 0.18,
      outputTokenCost: 0.18,
      isTemplate: false,
    },
    "nousresearch/nous-hermes-llama2-13b": {
      inputTokenCost: 0.17,
      outputTokenCost: 0.17,
      isTemplate: false,
    },
    "nousresearch/nous-hermes-yi-34b": {
      inputTokenCost: 0.72,
      outputTokenCost: 0.72,
      isTemplate: false,
    },
    "nothingiisreal/mn-celeste-12b": {
      inputTokenCost: 1.5,
      outputTokenCost: 1.5,
      isTemplate: false,
    },
    "open-orca/mistral-7b-openorca": {
      inputTokenCost: 0.18,
      outputTokenCost: 0.18,
      isTemplate: false,
    },
    "openchat/openchat-7b": {
      inputTokenCost: 0.055,
      outputTokenCost: 0.055,
      isTemplate: false,
    },
    "openchat/openchat-7b:free": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "openchat/openchat-8b": {
      inputTokenCost: 0.055,
      outputTokenCost: 0.055,
      isTemplate: false,
    },
    "openai/gpt-3.5-turbo-0613": {
      inputTokenCost: 1,
      outputTokenCost: 2,
      isTemplate: false,
    },
    "openai/gpt-3.5-turbo-16k": {
      inputTokenCost: 3,
      outputTokenCost: 4,
      isTemplate: false,
    },
    "openai/gpt-3.5-turbo-instruct": {
      inputTokenCost: 1.5,
      outputTokenCost: 2,
      isTemplate: false,
    },
    "openai/gpt-4-32k": {
      inputTokenCost: 60,
      outputTokenCost: 120,
      isTemplate: false,
    },
    "openai/gpt-4-32k-0314": {
      inputTokenCost: 60,
      outputTokenCost: 120,
      isTemplate: false,
    },
    "openai/gpt-4-turbo": {
      inputTokenCost: 10,
      outputTokenCost: 30,
      isTemplate: false,
    },
    "openai/gpt-4-turbo-preview": {
      inputTokenCost: 10,
      outputTokenCost: 30,
      isTemplate: false,
    },
    "openai/gpt-4-vision-preview": {
      inputTokenCost: 10,
      outputTokenCost: 30,
      isTemplate: false,
    },
    "openai/gpt-4o": {
      inputTokenCost: 5,
      outputTokenCost: 15,
      isTemplate: false,
    },
    "openai/gpt-4o:extended": {
      inputTokenCost: 6,
      outputTokenCost: 18,
      isTemplate: false,
    },
    "openai/gpt-4o-2024-05-13": {
      inputTokenCost: 5,
      outputTokenCost: 15,
      isTemplate: false,
    },
    "openai/gpt-4o-2024-08-06": {
      inputTokenCost: 2.5,
      outputTokenCost: 10,
      isTemplate: false,
    },
    "openai/gpt-4o-latest": {
      inputTokenCost: 5,
      outputTokenCost: 15,
      isTemplate: false,
    },
    "openai/gpt-4o-mini": {
      inputTokenCost: 0.15,
      outputTokenCost: 0.6,
      isTemplate: false,
    },
    "openai/gpt-4o-mini-2024-07-18": {
      inputTokenCost: 0.15,
      outputTokenCost: 0.6,
      isTemplate: false,
    },
    "openrouter/auto": null,
    "openrouter/flavor-of-the-week": null,
    "perplexity/llama-3-sonar-large-32k-chat": {
      inputTokenCost: 1,
      outputTokenCost: 1,
      isTemplate: false,
    },
    "perplexity/llama-3-sonar-large-32k-online": {
      inputTokenCost: 1,
      outputTokenCost: 1,
      isTemplate: false,
    },
    "perplexity/llama-3-sonar-small-32k-chat": {
      inputTokenCost: 0.2,
      outputTokenCost: 0.2,
      isTemplate: false,
    },
    "perplexity/llama-3-sonar-small-32k-online": {
      inputTokenCost: 0.2,
      outputTokenCost: 0.2,
      isTemplate: false,
    },
    "perplexity/llama-3.1-sonar-huge-128k-online": {
      inputTokenCost: 5,
      outputTokenCost: 5,
      isTemplate: false,
    },
    "perplexity/llama-3.1-sonar-large-128k-chat": {
      inputTokenCost: 1,
      outputTokenCost: 1,
      isTemplate: false,
    },
    "perplexity/llama-3.1-sonar-large-128k-online": {
      inputTokenCost: 1,
      outputTokenCost: 1,
      isTemplate: false,
    },
    "perplexity/llama-3.1-sonar-small-128k-chat": {
      inputTokenCost: 0.2,
      outputTokenCost: 0.2,
      isTemplate: false,
    },
    "perplexity/llama-3.1-sonar-small-128k-online": {
      inputTokenCost: 0.2,
      outputTokenCost: 0.2,
      isTemplate: false,
    },
    "phind/phind-codellama-34b": {
      inputTokenCost: 0.72,
      outputTokenCost: 0.72,
      isTemplate: false,
    },
    "pygmalionai/mythalion-13b": {
      inputTokenCost: 1.125,
      outputTokenCost: 1.125,
      isTemplate: false,
    },
    "qwen/qwen-110b-chat": {
      inputTokenCost: 1.62,
      outputTokenCost: 1.62,
      isTemplate: false,
    },
    "qwen/qwen-14b-chat": {
      inputTokenCost: 0.27,
      outputTokenCost: 0.27,
      isTemplate: false,
    },
    "qwen/qwen-2-72b-instruct": {
      inputTokenCost: 0.35,
      outputTokenCost: 0.4,
      isTemplate: false,
    },
    "qwen/qwen-2-7b-instruct": {
      inputTokenCost: 0.055,
      outputTokenCost: 0.055,
      isTemplate: false,
    },
    "qwen/qwen-2-7b-instruct:free": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "qwen/qwen-32b-chat": {
      inputTokenCost: 0.72,
      outputTokenCost: 0.72,
      isTemplate: false,
    },
    "qwen/qwen-4b-chat": {
      inputTokenCost: 0.09,
      outputTokenCost: 0.09,
      isTemplate: false,
    },
    "qwen/qwen-72b-chat": {
      inputTokenCost: 0.81,
      outputTokenCost: 0.81,
      isTemplate: false,
    },
    "qwen/qwen-7b-chat": {
      inputTokenCost: 0.18,
      outputTokenCost: 0.18,
      isTemplate: false,
    },
    "recursal/eagle-7b": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "recursal/rwkv-5-3b-ai-town": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "rwkv/rwkv-5-world-3b": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "sao10k/fimbulvetr-11b-v2": {
      inputTokenCost: 0.375,
      outputTokenCost: 1.5,
      isTemplate: false,
    },
    "sao10k/l3-euryale-70b": {
      inputTokenCost: 0.35,
      outputTokenCost: 0.4,
      isTemplate: false,
    },
    "sao10k/l3-lunaris-8b": {
      inputTokenCost: 2,
      outputTokenCost: 2,
      isTemplate: false,
    },
    "sao10k/l3-stheno-8b": {
      inputTokenCost: 0.25,
      outputTokenCost: 1.5,
      isTemplate: false,
    },
    "snowflake/snowflake-arctic-instruct": {
      inputTokenCost: 2.16,
      outputTokenCost: 2.16,
      isTemplate: false,
    },
    "sophosympatheia/midnight-rose-70b": {
      inputTokenCost: 0.8,
      outputTokenCost: 0.8,
      isTemplate: false,
    },
    "teknium/openhermes-2-mistral-7b": {
      inputTokenCost: 0.18,
      outputTokenCost: 0.18,
      isTemplate: false,
    },
    "teknium/openhermes-2.5-mistral-7b": {
      inputTokenCost: 0.17,
      outputTokenCost: 0.17,
      isTemplate: false,
    },
    "togethercomputer/stripedhyena-hessian-7b": {
      inputTokenCost: 0.18,
      outputTokenCost: 0.18,
      isTemplate: false,
    },
    "togethercomputer/stripedhyena-nous-7b": {
      inputTokenCost: 0.18,
      outputTokenCost: 0.18,
      isTemplate: false,
    },
    "undi95/remm-slerp-l2-13b": {
      inputTokenCost: 0.27,
      outputTokenCost: 0.27,
      isTemplate: false,
    },
    "undi95/remm-slerp-l2-13b:extended": {
      inputTokenCost: 1.125,
      outputTokenCost: 1.125,
      isTemplate: false,
    },
    "undi95/toppy-m-7b": {
      inputTokenCost: 0.07,
      outputTokenCost: 0.07,
      isTemplate: false,
    },
    "undi95/toppy-m-7b:free": {
      inputTokenCost: 0,
      outputTokenCost: 0,
      isTemplate: false,
    },
    "undi95/toppy-m-7b:nitro": {
      inputTokenCost: 0.07,
      outputTokenCost: 0.07,
      isTemplate: false,
    },
    "xwin-lm/xwin-lm-70b": {
      inputTokenCost: 3.75,
      outputTokenCost: 3.75,
      isTemplate: false,
    },
  },
  other: {
    other: null,
  },
});
