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
