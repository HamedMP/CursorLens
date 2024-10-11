import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import LogDetails from "./LogDetails";

// Mock the fetch function
vi.mock("node-fetch");

describe("LogDetails", () => {
  const mockLogId = "123";
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
    await act(async () => {
      render(<LogDetails logId={mockLogId} />);
    });

    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/loading/i).length).toBeGreaterThan(0);

    // Resolve the fetch promise with a minimal valid log object
    await act(async () => {
      fetchResolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 123,
            method: "GET",
            url: "/test",
            timestamp: "2023-04-01T12:00:00Z",
            headers: "{}",
            body: "{}",
            response: "{}",
            metadata: {
              inputTokens: 0,
              outputTokens: 0,
              totalTokens: 0,
              inputCost: 0,
              outputCost: 0,
              totalCost: 0,
            },
          }),
      });
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
    const mockLog = {
      id: 123,
      method: "GET",
      url: "/api/test",
      timestamp: "2023-04-01T12:00:00Z",
      headers: '{"Content-Type": "application/json"}',
      body: '{"key": "value"}',
      response: '{"result": "success"}',
      metadata: {
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
        inputCost: 0.001,
        outputCost: 0.002,
        totalCost: 0.003,
      },
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLog),
    });

    render(<LogDetails logId={mockLogId} />);

    await waitFor(() => {
      expect(screen.getByText("GET /api/test")).toBeInTheDocument();
      expect(screen.getByText("2023-04-01T12:00:00Z")).toBeInTheDocument();
      expect(screen.getByText("Input Tokens")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("Response")).toBeInTheDocument();
      expect(screen.getByText("Body")).toBeInTheDocument();
      expect(screen.getByText("Headers")).toBeInTheDocument();
    });
  });
});
