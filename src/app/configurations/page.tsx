"use client";

import { useState, useEffect, useMemo } from "react";
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

  const fetchConfigurations = async () => {
    try {
      const configData = await getConfigurations();
      setConfigurations(configData as AIConfiguration[]);
    } catch (error) {
      console.error("Error fetching configurations:", error);
      setError("Error loading configurations");
    }
  };

  const handleCreateConfig = async () => {
    try {
      await createConfiguration(newConfig);
      setIsDialogOpen(false);
      setNewConfig({});
      fetchConfigurations();
    } catch (error) {
      console.error("Error creating configuration:", error);
      setError("Error creating configuration");
    }
  };

  const handleToggleDefault = async (configId: string, isDefault: boolean) => {
    try {
      await updateDefaultConfiguration(configId);
      fetchConfigurations();
    } catch (error) {
      console.error("Error updating default configuration:", error);
      setError("Error updating default configuration");
    }
  };

  const handleTemplateSelect = (template: (typeof configTemplates)[0]) => {
    const readableName = `${template.provider.charAt(0).toUpperCase() + template.provider.slice(1)} ${template.model}`;
    setNewConfig({ ...template, name: readableName });
    setSelectedProvider(template.provider);
    setSelectedModel(template.model);
  };

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    setSelectedModel("");
    setNewConfig({
      ...newConfig,
      provider: value === "other" ? "" : value,
      model: "",
    });
    setCustomProvider("");
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    setNewConfig({ ...newConfig, model: value === "Other" ? "" : value });
    setCustomModel("");
  };

  const handleCustomProviderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCustomProvider(e.target.value);
    setNewConfig({ ...newConfig, provider: e.target.value });
  };

  const handleCustomModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomModel(e.target.value);
    setNewConfig({ ...newConfig, model: e.target.value });
  };

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
                    {Object.keys(providerModels).map((provider) => (
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
                      providerModels[
                        selectedProvider as keyof typeof providerModels
                      ].map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedModel === "Other" && (
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
            <div className="mt-4 flex justify-end">
              <Button onClick={handleCreateConfig}>Create Configuration</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
