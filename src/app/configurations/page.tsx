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
    name: "OpenAI GPT-3.5",
    provider: "openai",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  {
    name: "OpenAI GPT-4",
    provider: "openai",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 8192,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  {
    name: "Anthropic Claude",
    provider: "anthropic",
    model: "claude-2",
    temperature: 0.7,
    maxTokens: 100000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
];

export default function ConfigurationsPage() {
  const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
  const [newConfig, setNewConfig] = useState<Partial<AIConfiguration>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setNewConfig({ ...template });
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Configuration</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4">
            <div className="grid grid-cols-4 items-center gap-4">
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
              <Input
                id="provider"
                value={newConfig.provider || ""}
                onChange={(e) =>
                  setNewConfig({ ...newConfig, provider: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Model
              </Label>
              <Input
                id="model"
                value={newConfig.model || ""}
                onChange={(e) =>
                  setNewConfig({ ...newConfig, model: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label>Templates</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {configTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleTemplateSelect(template)}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleCreateConfig}>Create Configuration</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
