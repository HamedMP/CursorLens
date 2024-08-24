"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { PlusIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getConfigurations,
  updateDefaultConfiguration,
  createConfiguration,
} from "../actions";
import {
  getModelConfigurations,
  type ModelConfigurations,
} from "@/lib/model-config";

interface AIConfiguration {
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
}

const configTemplates = [
  {
    name: "OpenAI GPT-4",
    provider: "openai",
    model: "gpt-4-turbo",
    temperature: 0.7,
    maxTokens: 8192,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  {
    name: "OpenAI GPT-4 Optimized",
    provider: "openai",
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 8192,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  {
    name: "OpenAI GPT-4 Mini",
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  {
    name: "Anthropic Claude 3.5 Sonnet",
    provider: "anthropic",
    model: "claude-3-5-sonnet-20240620",
    temperature: 0.7,
    maxTokens: 200000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  {
    name: "Mistral Large",
    provider: "mistral",
    model: "mistral-large-latest",
    temperature: 0.7,
    maxTokens: 32768,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  {
    name: "Groq LLaMA 3.1",
    provider: "groq",
    model: "llama-3.1-70b-versatile",
    temperature: 0.7,
    maxTokens: 32768,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
];

const providerModels = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  anthropic: [
    "claude-3-5-sonnet-20240620",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
  ],
  cohere: ["command-r", "command-r-plus"],
  mistral: [
    "mistral-large-latest",
    "mistral-medium-latest",
    "mistral-small-latest",
    "open-mistral-nemo",
    "open-mixtral-8x22b",
    "open-mixtral-8x7b",
    "open-mistral-7b",
  ],
  groq: [
    "llama-3.1-405b-reasoning",
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
  ],
  ollama: [
    "llama3.1",
    "codegemma",
    "codegemma:2b",
    "codegemma:7b",
    "codellama",
    "codellama:7b",
    "codellama:13b",
    "codellama:34b",
    "codellama:70b",
    "codellama:code",
    "codellama:python",
    "command-r",
    "command-r:35b",
    "command-r-plus",
    "command-r-plus:104b",
    "deepseek-coder-v2",
    "deepseek-coder-v2:16b",
    "deepseek-coder-v2:236b",
    "falcon2",
    "falcon2:11b",
    "gemma",
    "gemma:2b",
    "gemma:7b",
    "gemma2",
    "gemma2:2b",
    "gemma2:9b",
    "gemma2:27b",
    "llama2",
    "llama2:7b",
    "llama2:13b",
    "llama2:70b",
    "llama3",
    "llama3:8b",
    "llama3:70b",
    "llama3-chatqa",
    "llama3-chatqa:8b",
    "llama3-chatqa:70b",
    "llama3-gradient",
    "llama3-gradient:8b",
    "llama3-gradient:70b",
    "llama3.1",
    "llama3.1:8b",
    "llama3.1:70b",
    "llama3.1:405b",
    "llava",
    "llava:7b",
    "llava:13b",
    "llava:34b",
    "llava-llama3",
    "llava-llama3:8b",
    "llava-phi3",
    "llava-phi3:3.8b",
    "mistral",
    "mistral:7b",
    "mistral-large",
    "mistral-large:123b",
    "mistral-nemo",
    "mistral-nemo:12b",
    "mixtral",
    "mixtral:8x7b",
    "mixtral:8x22b",
    "moondream",
    "moondream:1.8b",
    "openhermes",
    "openhermes:v2.5",
    "qwen",
    "qwen:7b",
    "qwen:14b",
    "qwen:32b",
    "qwen:72b",
    "qwen:110b",
    "qwen2",
    "qwen2:0.5b",
    "qwen2:1.5b",
    "qwen2:7b",
    "qwen2:72b",
    "phi3",
    "phi3:3.8b",
    "phi3:14b",
  ],
  openrouter: [
    "01-ai/yi-large",
    "01-ai/yi-large-fc",
    "01-ai/yi-large-turbo",
    "01-ai/yi-34b",
    "01-ai/yi-34b-chat",
    "01-ai/yi-6b",
    "01-ai/yi-vision",
    "aetherwiing/mn-starcannon-12b",
    "ai21/jamba-instruct",
    "allenai/olmo-7b-instruct",
    "alpindale/goliath-120b",
    "alpindale/magnum-72b",
    "anthropic/claude-1",
    "anthropic/claude-1.2",
    "anthropic/claude-2",
    "anthropic/claude-2:beta",
    "anthropic/claude-2.0",
    "anthropic/claude-2.0:beta",
    "anthropic/claude-2.1",
    "anthropic/claude-2.1:beta",
    "anthropic/claude-3-haiku",
    "anthropic/claude-3-haiku:beta",
    "anthropic/claude-3-opus",
    "anthropic/claude-3-opus:beta",
    "anthropic/claude-3-sonnet",
    "anthropic/claude-3.5-sonnet",
    "anthropic/claude-3.5-sonnet:beta",
    "anthropic/claude-3-sonnet:beta",
    "anthropic/claude-instant-1",
    "anthropic/claude-instant-1:beta",
    "anthropic/claude-instant-1.0",
    "anthropic/claude-instant-1.1",
    "austism/chronos-hermes-13b",
    "cohere/command",
    "cohere/command-r",
    "cohere/command-r-plus",
    "cognitivecomputations/dolphin-llama-3-70b",
    "cognitivecomputations/dolphin-mixtral-8x22b",
    "cognitivecomputations/dolphin-mixtral-8x7b",
    "databricks/dbrx-instruct",
    "deepseek/deepseek-chat",
    "deepseek/deepseek-coder",
    "google/gemini-flash-1.5",
    "google/gemini-pro",
    "google/gemini-pro-1.5",
    "google/gemini-pro-1.5-exp",
    "google/gemini-pro-vision",
    "google/gemma-2-27b-it",
    "google/gemma-2-9b-it",
    "google/gemma-2-9b-it:free",
    "google/gemma-7b-it",
    "google/gemma-7b-it:free",
    "google/gemma-7b-it:nitro",
    "google/palm-2-chat-bison",
    "google/palm-2-chat-bison-32k",
    "google/palm-2-codechat-bison",
    "google/palm-2-codechat-bison-32k",
    "gryphe/mythomist-7b",
    "gryphe/mythomist-7b:free",
    "gryphe/mythomax-l2-13b",
    "huggingfaceh4/zephyr-7b-beta:free",
    "jondurbin/airoboros-l2-70b",
    "lizpreciatior/lzlv-70b-fp16-hf",
    "lynn/soliloquy-l3",
    "mancer/weaver",
    "meta-llama/codellama-34b-instruct",
    "meta-llama/codellama-70b-instruct",
    "meta-llama/llama-3-70b",
    "meta-llama/llama-3-70b-instruct",
    "meta-llama/llama-3-70b-instruct:nitro",
    "meta-llama/llama-3-8b",
    "meta-llama/llama-3-8b-instruct",
    "meta-llama/llama-3-8b-instruct:extended",
    "meta-llama/llama-3-8b-instruct:free",
    "meta-llama/llama-3-8b-instruct:nitro",
    "meta-llama/llama-3.1-405b",
    "meta-llama/llama-3.1-405b-instruct",
    "meta-llama/llama-3.1-70b-instruct",
    "meta-llama/llama-3.1-8b-instruct",
    "meta-llama/llama-3.1-8b-instruct:free",
    "meta-llama/llama-guard-2-8b",
    "microsoft/phi-3-medium-128k-instruct",
    "microsoft/phi-3-medium-128k-instruct:free",
    "microsoft/phi-3-medium-4k-instruct",
    "microsoft/phi-3-mini-128k-instruct",
    "microsoft/phi-3-mini-128k-instruct:free",
    "microsoft/wizardlm-2-7b",
    "microsoft/wizardlm-2-8x22b",
    "mistralai/codestral-mamba",
    "mistralai/mistral-7b-instruct",
    "mistralai/mistral-7b-instruct:free",
    "mistralai/mistral-7b-instruct:nitro",
    "mistralai/mistral-7b-instruct-v0.1",
    "mistralai/mistral-7b-instruct-v0.2",
    "mistralai/mistral-7b-instruct-v0.3",
    "mistralai/mistral-large",
    "mistralai/mistral-medium",
    "mistralai/mistral-nemo",
    "mistralai/mistral-small",
    "mistralai/mistral-tiny",
    "mistralai/mixtral-8x22b",
    "mistralai/mixtral-8x22b-instruct",
    "mistralai/mixtral-8x7b",
    "mistralai/mixtral-8x7b-instruct",
    "mistralai/mixtral-8x7b-instruct:nitro",
    "neversleep/llama-3-lumimaid-70b",
    "neversleep/llama-3-lumimaid-8b",
    "neversleep/llama-3-lumimaid-8b:extended",
    "neversleep/noromaid-20b",
    "nousresearch/hermes-2-pro-llama-3-8b",
    "nousresearch/hermes-2-theta-llama-3-8b",
    "nousresearch/hermes-3-llama-3.1-405b",
    "nousresearch/hermes-3-llama-3.1-405b:extended",
    "nousresearch/nous-capybara-7b",
    "nousresearch/nous-capybara-7b:free",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
    "nousresearch/nous-hermes-2-mixtral-8x7b-sft",
    "nousresearch/nous-hermes-2-mistral-7b-dpo",
    "nousresearch/nous-hermes-llama2-13b",
    "nousresearch/nous-hermes-yi-34b",
    "nothingiisreal/mn-celeste-12b",
    "open-orca/mistral-7b-openorca",
    "openchat/openchat-7b",
    "openchat/openchat-7b:free",
    "openchat/openchat-8b",
    "openai/gpt-3.5-turbo-0613",
    "openai/gpt-3.5-turbo-16k",
    "openai/gpt-3.5-turbo-instruct",
    "openai/gpt-4-32k",
    "openai/gpt-4-32k-0314",
    "openai/gpt-4-turbo",
    "openai/gpt-4-turbo-preview",
    "openai/gpt-4-vision-preview",
    "openai/gpt-4o",
    "openai/gpt-4o:extended",
    "openai/gpt-4o-2024-05-13",
    "openai/gpt-4o-2024-08-06",
    "openai/gpt-4o-latest",
    "openai/gpt-4o-mini",
    "openai/gpt-4o-mini-2024-07-18",
    "openrouter/auto",
    "openrouter/flavor-of-the-week",
    "perplexity/llama-3-sonar-large-32k-chat",
    "perplexity/llama-3-sonar-large-32k-online",
    "perplexity/llama-3-sonar-small-32k-chat",
    "perplexity/llama-3-sonar-small-32k-online",
    "perplexity/llama-3.1-sonar-huge-128k-online",
    "perplexity/llama-3.1-sonar-large-128k-chat",
    "perplexity/llama-3.1-sonar-large-128k-online",
    "perplexity/llama-3.1-sonar-small-128k-chat",
    "perplexity/llama-3.1-sonar-small-128k-online",
    "phind/phind-codellama-34b",
    "pygmalionai/mythalion-13b",
    "qwen/qwen-110b-chat",
    "qwen/qwen-14b-chat",
    "qwen/qwen-2-72b-instruct",
    "qwen/qwen-2-7b-instruct",
    "qwen/qwen-2-7b-instruct:free",
    "qwen/qwen-32b-chat",
    "qwen/qwen-4b-chat",
    "qwen/qwen-72b-chat",
    "qwen/qwen-7b-chat",
    "recursal/eagle-7b",
    "recursal/rwkv-5-3b-ai-town",
    "rwkv/rwkv-5-world-3b",
    "sao10k/fimbulvetr-11b-v2",
    "sao10k/l3-euryale-70b",
    "sao10k/l3-lunaris-8b",
    "sao10k/l3-stheno-8b",
    "snowflake/snowflake-arctic-instruct",
    "sophosympatheia/midnight-rose-70b",
    "teknium/openhermes-2-mistral-7b",
    "teknium/openhermes-2.5-mistral-7b",
    "togethercomputer/stripedhyena-hessian-7b",
    "togethercomputer/stripedhyena-nous-7b",
    "undi95/remm-slerp-l2-13b",
    "undi95/remm-slerp-l2-13b:extended",
    "undi95/toppy-m-7b",
    "undi95/toppy-m-7b:free",
    "undi95/toppy-m-7b:nitro",
    "xwin-lm/xwin-lm-70b",
  ],
  other: ["Other"],
};

export default function ConfigurationsPage() {
  const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
  const [newConfig, setNewConfig] = useState<Partial<AIConfiguration>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [customProvider, setCustomProvider] = useState<string>("");
  const [customModel, setCustomModel] = useState<string>("");
  const modelConfigurations: ModelConfigurations = useMemo(
    () => getModelConfigurations(),
    [],
  );

  const sortedConfigurations = useMemo(() => {
    return [...configurations].sort((a, b) => {
      if (a.provider !== b.provider) {
        return a.provider.localeCompare(b.provider);
      }
      return a.name.localeCompare(b.name);
    });
  }, [configurations]);

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = useCallback(async () => {
    try {
      const configData = await getConfigurations();
      setConfigurations(configData as AIConfiguration[]);
    } catch (error) {
      console.error("Error fetching configurations:", error);
      setError("Error loading configurations");
    }
  }, []);

  const handleCreateConfig = useCallback(async () => {
    if (!newConfig.name || !newConfig.provider || !newConfig.model) {
      setError("Name, provider, and model are required fields");
      return;
    }

    try {
      await createConfiguration(newConfig);
      setIsDialogOpen(false);
      setNewConfig({});
      fetchConfigurations();
    } catch (error) {
      console.error("Error creating configuration:", error);
      // TODO: Implement better error handling and user feedback
      // - Handle specific errors (e.g., unique constraint violations)
      // - Display error messages in the UI (e.g., using a toast notification)
      // - Highlight fields with errors
      // - Prevent dialog from closing on error
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint failed")
      ) {
        setError(
          "A configuration with this name already exists. Please choose a different name.",
        );
      } else {
        setError("Error creating configuration. Please try again.");
      }
    }
  }, [newConfig, fetchConfigurations]);

  const handleToggleDefault = useCallback(
    async (configId: string, isDefault: boolean) => {
      try {
        await updateDefaultConfiguration(configId);
        fetchConfigurations();
      } catch (error) {
        console.error("Error updating default configuration:", error);
        setError("Error updating default configuration");
      }
    },
    [fetchConfigurations],
  );

  // TODO: Implement proper handling when turning off a default configuration
  // - Prevent turning off the last default configuration
  // - Show a toast message explaining why the action is not allowed
  // - Implement logic to ensure at least one configuration is always set as default

  const handleTemplateSelect = useCallback(
    (provider: string, model: string): void => {
      const providerConfigs = modelConfigurations[provider];

      if (!providerConfigs) {
        console.error(`No configurations found for provider: ${provider}`);
        return;
      }

      const config = providerConfigs[model];

      if (!config || !("isTemplate" in config) || !config.isTemplate) {
        console.error(
          `No valid template configuration found for model: ${model}`,
        );
        return;
      }

      const readableName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} ${model}`;

      setNewConfig({
        ...config,
        name: readableName,
        provider,
        model,
      });
      setSelectedProvider(provider);
      setSelectedModel(model);
    },
    [modelConfigurations],
  );

  const templateButtons = useMemo(
    () =>
      Object.entries(modelConfigurations).flatMap(([provider, models]) =>
        Object.entries(models)
          .filter(
            ([_, config]) =>
              config && "isTemplate" in config && config.isTemplate,
          )
          .map(([model, config]) => (
            <Button
              key={`${provider}-${model}`}
              variant="outline"
              className="w-full"
              onClick={() => handleTemplateSelect(provider, model)}
            >
              {config && "name" in config
                ? config.name
                : `${provider} ${model}`}
            </Button>
          )),
      ),
    [modelConfigurations, handleTemplateSelect],
  );

  const handleProviderChange = useCallback(
    (value: string) => {
      setSelectedProvider(value);
      setSelectedModel("");
      setNewConfig({
        ...newConfig,
        provider: value === "other" ? "" : value,
        model: "",
      });
      setCustomProvider("");
    },
    [newConfig],
  );

  const handleModelChange = useCallback(
    (value: string) => {
      setSelectedModel(value);
      setNewConfig({ ...newConfig, model: value === "other" ? "" : value });
      setCustomModel("");
    },
    [newConfig],
  );

  const handleCustomProviderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomProvider(e.target.value);
      setNewConfig({ ...newConfig, provider: e.target.value });
    },
    [newConfig],
  );

  const handleCustomModelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomModel(e.target.value);
      setNewConfig({ ...newConfig, model: e.target.value });
    },
    [newConfig],
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">AI Configurations</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Configuration List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Max Tokens</TableHead>
                <TableHead>Default</TableHead>
                {/* TODO: Add an "Actions" column for edit functionality */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedConfigurations.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>{config.name}</TableCell>
                  <TableCell>{config.provider}</TableCell>
                  <TableCell>{config.model}</TableCell>
                  <TableCell>{config.temperature}</TableCell>
                  <TableCell>{config.maxTokens}</TableCell>
                  <TableCell>
                    <Switch
                      checked={config.isDefault}
                      onCheckedChange={(checked) =>
                        handleToggleDefault(config.id, checked)
                      }
                    />
                  </TableCell>
                  {/* TODO: Add an edit button or icon in this cell */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Configuration
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[475px]">
          <DialogHeader>
            <DialogTitle>Add New Configuration</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4">
            <div className="mt-4">
              <Label>Templates</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {configTemplates.map((template, index) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    className="w-full"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newConfig.name || ""}
                onChange={(e) =>
                  setNewConfig({ ...newConfig, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="provider" className="text-right">
                Provider
              </Label>
              <div className="col-span-3">
                <Select
                  value={selectedProvider}
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(modelConfigurations).map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProvider === "other" && (
                  <Input
                    id="customProvider"
                    value={customProvider}
                    onChange={handleCustomProviderChange}
                    placeholder="Enter custom provider"
                    className="mt-2"
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Model
              </Label>
              <div className="col-span-3">
                <Select
                  value={selectedModel}
                  onValueChange={handleModelChange}
                  disabled={!selectedProvider}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProvider &&
                      Object.keys(
                        modelConfigurations[selectedProvider] || {},
                      ).map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedModel === "other" && (
                  <Input
                    id="customModel"
                    value={customModel}
                    onChange={handleCustomModelChange}
                    placeholder="Enter custom model"
                    className="mt-2"
                  />
                )}
              </div>
            </div>
            {error && (
              <div className="mb-4 mt-2 text-sm text-red-500">{error}</div>
            )}
            <div className="mt-4 flex justify-end">
              <Button onClick={handleCreateConfig}>Create Configuration</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
