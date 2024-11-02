import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIConfiguration, ModelConfigurations } from "@/types";
import { getModelConfigurations } from "@/lib/model-config";

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Partial<AIConfiguration>) => Promise<void>;
  initialConfig?: Partial<AIConfiguration>;
  title: string;
}

export function ConfigurationModal({
  isOpen,
  onClose,
  onSave,
  initialConfig,
  title,
}: ConfigurationModalProps) {
  const [config, setConfig] = useState<Partial<AIConfiguration>>(
    initialConfig || {},
  );
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>(
    initialConfig?.provider || "",
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    initialConfig?.model || "",
  );
  const [customProvider, setCustomProvider] = useState<string>("");
  const [customModel, setCustomModel] = useState<string>("");
  const modelConfigurations: ModelConfigurations = useMemo(
    () => getModelConfigurations(),
    [],
  );
  const [costData, setCostData] = useState({
    inputTokenCost: "",
    outputTokenCost: "",
  });

  useEffect(() => {
    const fetchCostData = async () => {
      if (config.provider && config.model) {
        try {
          const response = await fetch(
            `/api/costs/current?provider=${config.provider}&model=${config.model}`,
          );
          if (response.ok) {
            const data = await response.json();
            if (data) {
              setCostData({
                inputTokenCost: data.inputTokenCost.toString(),
                outputTokenCost: data.outputTokenCost.toString(),
              });
            }
          }
        } catch (error) {
          console.error("Error fetching cost data:", error);
        }
      }
    };

    fetchCostData();
  }, [config.provider, config.model]);

  const handleSave = useCallback(async () => {
    if (!config.name || !config.provider || !config.model) {
      setError("Name, provider, and model are required fields");
      return;
    }

    const configToSave = { ...config };

    if (costData.inputTokenCost && costData.outputTokenCost) {
      configToSave.cost = {
        inputTokenCost: parseFloat(costData.inputTokenCost),
        outputTokenCost: parseFloat(costData.outputTokenCost),
        validFrom: new Date(),
      };
    }

    try {
      await onSave(configToSave);
      onClose();
    } catch (error) {
      console.error("Error saving configuration:", error);
      setError("Error saving configuration. Please try again.");
    }
  }, [config, costData, onSave, onClose]);

  const handleTemplateSelect = useCallback(
    (provider: string, model: string): void => {
      const providerConfigs = modelConfigurations[provider];

      if (!providerConfigs) {
        console.error(`No configurations found for provider: ${provider}`);
        return;
      }

      const modelConfig = providerConfigs[model];

      if (
        !modelConfig ||
        !("isTemplate" in modelConfig) ||
        !modelConfig.isTemplate
      ) {
        console.error(
          `No valid template configuration found for model: ${model}`,
        );
        return;
      }

      const readableName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} ${model}`;

      setConfig({
        ...modelConfig,
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
      setConfig({
        ...config,
        provider: value === "other" ? "" : value,
        model: "",
      });
      setCustomProvider("");
    },
    [config],
  );

  const handleModelChange = useCallback(
    (value: string) => {
      setSelectedModel(value);
      setConfig({ ...config, model: value === "other" ? "" : value });
      setCustomModel("");
    },
    [config],
  );

  const handleCustomProviderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomProvider(e.target.value);
      setConfig({ ...config, provider: e.target.value });
    },
    [config],
  );

  const handleCustomModelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomModel(e.target.value);
      setConfig({ ...config, model: e.target.value });
    },
    [config],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const configData = {
      /* existing config data */
    };

    if (costData.inputTokenCost && costData.outputTokenCost) {
      configData.cost = {
        inputTokenCost: parseFloat(costData.inputTokenCost),
        outputTokenCost: parseFloat(costData.outputTokenCost),
        validFrom: new Date(),
      };
    }

    onSave(configData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4">
          {!initialConfig && (
            <div className="mt-4">
              <Label>Templates</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {templateButtons}
              </div>
            </div>
          )}
          <div className="mt-2 grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={config.name || ""}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
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
          <div className="space-y-4">
            <h4 className="font-medium">
              Cost Configuration (USD per million tokens)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inputTokenCost">
                  Input Token Cost
                  <span className="ml-1 text-xs text-muted-foreground">
                    (per 1M tokens)
                  </span>
                </Label>
                <Input
                  id="inputTokenCost"
                  type="number"
                  step="0.01"
                  value={costData.inputTokenCost}
                  onChange={(e) =>
                    setCostData({
                      ...costData,
                      inputTokenCost: e.target.value,
                    })
                  }
                  placeholder="e.g., 0.50"
                />
              </div>
              <div>
                <Label htmlFor="outputTokenCost">
                  Output Token Cost
                  <span className="ml-1 text-xs text-muted-foreground">
                    (per 1M tokens)
                  </span>
                </Label>
                <Input
                  id="outputTokenCost"
                  type="number"
                  step="0.01"
                  value={costData.outputTokenCost}
                  onChange={(e) =>
                    setCostData({
                      ...costData,
                      outputTokenCost: e.target.value,
                    })
                  }
                  placeholder="e.g., 1.50"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Current costs for this provider/model combination are shown
              if available. Leave fields unchanged to keep using the current
              cost configuration.
            </p>
          </div>
          {error && (
            <div className="mb-4 mt-2 text-sm text-red-500">{error}</div>
          )}
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSave}>Save Configuration</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
