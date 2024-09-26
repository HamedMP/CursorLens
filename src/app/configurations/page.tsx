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
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
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
  deleteConfiguration,
  updateConfiguration,
} from "../actions";
import {
  getModelConfigurations,
  type ModelConfigurations,
} from "@/lib/model-config";
import { ConfigurationModal } from "@/components/ConfigurationModal";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfiguration | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
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

  const handleCreateConfig = useCallback(
    async (newConfig: Partial<AIConfiguration>) => {
      try {
        await createConfiguration(newConfig);
        fetchConfigurations();
      } catch (error) {
        console.error("Error creating configuration:", error);
        setError("Error creating configuration. Please try again.");
      }
    },
    [fetchConfigurations],
  );

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

  const handleDeleteConfig = useCallback(
    async (configId: string) => {
      if (confirm("Are you sure you want to delete this configuration?")) {
        try {
          await deleteConfiguration(configId);
          fetchConfigurations();
        } catch (error) {
          console.error("Error deleting configuration:", error);
          setError("Failed to delete configuration. Please try again.");
        }
      }
    },
    [fetchConfigurations],
  );

  const handleEditConfig = useCallback(
    async (updatedConfig: Partial<AIConfiguration>) => {
      if (!editingConfig) return;
      try {
        await updateConfiguration(editingConfig.id, updatedConfig);
        fetchConfigurations();
        setEditingConfig(null);
      } catch (error) {
        console.error("Error updating configuration:", error);
        setError("Error updating configuration. Please try again.");
      }
    },
    [editingConfig, fetchConfigurations],
  );

  const openEditModal = useCallback((config: AIConfiguration) => {
    setEditingConfig(config);
    setIsEditModalOpen(true);
  }, []);

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
                <TableHead>Actions</TableHead>
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
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(config)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteConfig(config.id)}
                        disabled={config.isDefault}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Button onClick={() => setIsAddModalOpen(true)}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Add Configuration
      </Button>

      <ConfigurationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreateConfig}
        title="Add New Configuration"
      />

      <ConfigurationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingConfig(null);
        }}
        onSave={handleEditConfig}
        initialConfig={editingConfig || undefined}
        title="Edit Configuration"
      />
    </div>
  );
}
