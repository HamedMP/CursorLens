"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, PencilIcon, Trash2Icon, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ModelCost {
  id: string;
  provider: string;
  model: string;
  inputTokenCost: number;
  outputTokenCost: number;
  validFrom: Date;
  validTo: Date | null;
}

type SortField =
  | "provider"
  | "model"
  | "inputTokenCost"
  | "outputTokenCost"
  | "validFrom";
type SortDirection = "asc" | "desc";

export function CostConfigurationTab() {
  const [costs, setCosts] = useState<ModelCost[]>([]);
  const [filteredCosts, setFilteredCosts] = useState<ModelCost[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<ModelCost | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("provider");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [formData, setFormData] = useState({
    provider: "",
    model: "",
    inputTokenCost: 0,
    outputTokenCost: 0,
    validFrom: new Date().toISOString().split("T")[0],
    validTo: "",
  });
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    try {
      const response = await fetch("/api/costs");
      const data = await response.json();
      setCosts(data);
    } catch (error) {
      console.error("Error fetching costs:", error);
    }
  };

  useEffect(() => {
    const filtered = costs.filter(
      (cost) =>
        (selectedProviders.length === 0 ||
          selectedProviders.includes(cost.provider)) &&
        (selectedModels.length === 0 || selectedModels.includes(cost.model)) &&
        (cost.provider.toLowerCase().includes(search.toLowerCase()) ||
          cost.model.toLowerCase().includes(search.toLowerCase())),
    );

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    setFilteredCosts(sorted);
  }, [
    costs,
    search,
    sortField,
    sortDirection,
    selectedProviders,
    selectedModels,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/costs", {
        method: editingCost ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id: editingCost?.id,
        }),
      });

      if (response.ok) {
        setIsAddModalOpen(false);
        setEditingCost(null);
        setFormData({
          provider: "",
          model: "",
          inputTokenCost: 0,
          outputTokenCost: 0,
          validFrom: new Date().toISOString().split("T")[0],
          validTo: "",
        });
        fetchCosts();
      }
    } catch (error) {
      console.error("Error saving cost:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cost configuration?")) {
      return;
    }

    try {
      await fetch(`/api/costs/${id}`, { method: "DELETE" });
      fetchCosts();
    } catch (error) {
      console.error("Error deleting cost:", error);
    }
  };

  const getUniqueValues = (field: "provider" | "model") => {
    return Array.from(new Set(costs.map((cost) => cost[field])));
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      anthropic: "bg-purple-100 text-purple-800 border-purple-300",
      openai: "bg-green-100 text-green-800 border-green-300",
      cohere: "bg-blue-100 text-blue-800 border-blue-300",
      mistral: "bg-red-100 text-red-800 border-red-300",
      groq: "bg-yellow-100 text-yellow-800 border-yellow-300",
      ollama: "bg-orange-100 text-orange-800 border-orange-300",
      other: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[provider.toLowerCase()] || colors.other;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Configurations</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search provider or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {getUniqueValues("provider").map((provider) => (
            <Badge
              key={provider}
              variant="outline"
              className={cn(
                "cursor-pointer transition-colors",
                getProviderColor(provider),
                selectedProviders.includes(provider)
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:opacity-80",
              )}
              onClick={() => {
                setSelectedProviders((prev) =>
                  prev.includes(provider)
                    ? prev.filter((p) => p !== provider)
                    : [...prev, provider],
                );
              }}
            >
              {provider}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("provider")}>
                  Provider <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("model")}>
                  Model <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("inputTokenCost")}
                >
                  Input Cost <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("outputTokenCost")}
                >
                  Output Cost <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("validFrom")}>
                  Valid From <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Valid To</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCosts.map((cost) => (
              <TableRow key={cost.id}>
                <TableCell>{cost.provider}</TableCell>
                <TableCell>{cost.model}</TableCell>
                <TableCell>${cost.inputTokenCost.toFixed(2)}</TableCell>
                <TableCell>${cost.outputTokenCost.toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(cost.validFrom).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {cost.validTo
                    ? new Date(cost.validTo).toLocaleDateString()
                    : "Indefinitely"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingCost(cost);
                        setFormData({
                          provider: cost.provider,
                          model: cost.model,
                          inputTokenCost: cost.inputTokenCost,
                          outputTokenCost: cost.outputTokenCost,
                          validFrom: new Date(cost.validFrom)
                            .toISOString()
                            .split("T")[0],
                          validTo: cost.validTo
                            ? new Date(cost.validTo).toISOString().split("T")[0]
                            : "",
                        });
                        setIsAddModalOpen(true);
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(cost.id)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button onClick={() => setIsAddModalOpen(true)} className="mt-4">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Cost Configuration
        </Button>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCost
                  ? "Edit Cost Configuration"
                  : "Add Cost Configuration"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="inputTokenCost">Input Token Cost (USD)</Label>
                <Input
                  id="inputTokenCost"
                  type="number"
                  step="0.000001"
                  value={formData.inputTokenCost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      inputTokenCost: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="outputTokenCost">Output Token Cost (USD)</Label>
                <Input
                  id="outputTokenCost"
                  type="number"
                  step="0.000001"
                  value={formData.outputTokenCost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      outputTokenCost: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="validTo">Valid To (Optional)</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={formData.validTo}
                  onChange={(e) =>
                    setFormData({ ...formData, validTo: e.target.value })
                  }
                />
              </div>
              <Button type="submit">
                {editingCost ? "Update" : "Add"} Cost Configuration
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
