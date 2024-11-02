const NGROK_API = `${process.env.NGROK_API_URL || "http://localhost:4040"}/api`;

export async function startNgrokTunnel() {
  try {
    // In Docker, ngrok is already running via docker-compose
    // Just fetch existing tunnels
    const response = await fetch(NGROK_API);
    if (!response.ok) {
      throw new Error(`Failed to connect to ngrok API: ${response.statusText}`);
    }

    const data = await response.json();
    const url = data.tunnels?.[0]?.public_url;

    if (!url) {
      throw new Error("No active tunnels found. Make sure ngrok is running.");
    }

    return url;
  } catch (error) {
    console.error("Error getting ngrok tunnel:", error);
    throw error;
  }
}

export async function getActiveTunnels() {
  const response = await fetch(`${NGROK_API}/tunnels`);
  if (!response.ok) {
    throw new Error("Failed to fetch tunnels");
  }
  const data = await response.json();
  return data.tunnels.map((tunnel: any) => tunnel.public_url);
}

// Note: When using Docker, stopping tunnels isn't necessary
// as they're managed by docker-compose
export async function stopNgrokTunnels() {
  return;
}
