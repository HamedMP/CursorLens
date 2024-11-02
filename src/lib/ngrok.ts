import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function startNgrokTunnel() {
  try {
    // Check if ngrok is running
    const { stdout: psOutput } = await execAsync("ps aux | grep ngrok");
    const isNgrokRunning = psOutput.toLowerCase().includes("ngrok http");

    if (!isNgrokRunning) {
      // Start ngrok in the background
      await execAsync("ngrok http 3000 > /dev/null 2>&1 &");
      // Wait a bit for ngrok to start
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Get the public URL from ngrok API
    const { stdout } = await execAsync(
      "curl -s http://localhost:4040/api/tunnels",
    );
    const tunnels = JSON.parse(stdout);
    const url = tunnels.tunnels?.[0]?.public_url;

    if (!url) {
      throw new Error("No active tunnels found");
    }

    return url;
  } catch (error) {
    console.error("Error starting ngrok tunnel:", error);
    throw error;
  }
}

export async function getActiveTunnels() {
  try {
    const { stdout } = await execAsync(
      "curl -s http://localhost:4040/api/tunnels",
    );
    const tunnels = JSON.parse(stdout);
    return tunnels.tunnels?.map((tunnel: any) => tunnel.public_url) || [];
  } catch (error) {
    console.error("Error getting tunnels:", error);
    throw error;
  }
}

export async function stopNgrokTunnels() {
  try {
    await execAsync("pkill ngrok");
  } catch (error) {
    console.error("Error stopping tunnels:", error);
    throw error;
  }
}
