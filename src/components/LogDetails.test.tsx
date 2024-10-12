import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import LogDetails from "./LogDetails";

describe("LogDetails", () => {
  const mockLogId = "123";
  const mockLog = {
    id: 123,
    method: "POST",
    url: "/api/test",
    headers: { "Content-Type": "application/json" },
    body: { message: "Test body" },
    response: { result: "Success" },
    timestamp: "2023-04-01T12:00:00Z",
    metadata: {
      provider: "openai",
      model: "gpt-3.5-turbo",
      inputTokens: 10,
      outputTokens: 20,
      totalTokens: 30,
      inputCost: 0.0001,
      outputCost: 0.0002,
      totalCost: 0.0003,
    },
  };
  let fetchResolve: (value: unknown) => void;

  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          fetchResolve = resolve;
        }),
    ) as Mock;
  });

  it("renders loading skeleton when log is not loaded", async () => {
    render(<LogDetails logId={mockLogId} />);

    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/loading/i).length).toBeGreaterThan(0);

    fetchResolve({
      ok: true,
      json: () => Promise.resolve(mockLog),
    });

    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  it("renders error message when fetch fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Failed to fetch"),
    );

    render(<LogDetails logId={mockLogId} />);

    await waitFor(() => {
      expect(screen.getByText("Error fetching log data")).toBeInTheDocument();
    });
  });

  it("renders log details when fetch is successful", async () => {
    render(<LogDetails logId={mockLogId} />);

    fetchResolve({
      ok: true,
      json: () => Promise.resolve(mockLog),
    });

    await waitFor(() => {
      expect(screen.getByText("POST /api/test")).toBeInTheDocument();
      expect(screen.getByText("2023-04-01T12:00:00Z")).toBeInTheDocument();
      expect(screen.getByText("Input Tokens")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("Output Tokens")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getByText("Total Tokens")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();
      expect(screen.getByText("Input Cost")).toBeInTheDocument();
      expect(screen.getByText("$0.0001")).toBeInTheDocument();
      expect(screen.getByText("Output Cost")).toBeInTheDocument();
      expect(screen.getByText("$0.0002")).toBeInTheDocument();
      expect(screen.getByText("Total Cost")).toBeInTheDocument();
      expect(screen.getByText("$0.0003")).toBeInTheDocument();
    });
  });
});
