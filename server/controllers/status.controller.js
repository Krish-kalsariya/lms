import mongoose from "mongoose";
import { networkInterfaces } from "os";

export const getStatus = (req, res) => {
  // Check database connection status
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };

  const dbStatus = {
    state: dbStates[dbState] || "Unknown",
    connected: dbState === 1,
    host: mongoose.connection.host || "N/A",
    name: mongoose.connection.name || "N/A",
  };

  // Server info
  const serverInfo = {
    status: "Running",
    uptime: formatUptime(process.uptime()),
    port: process.env.PORT || 8080,
    nodeEnv: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  };

  // Network info
  const nets = networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        addresses.push({ interface: name, ip: net.address });
      }
    }
  }

  res.status(200).json({
    success: true,
    server: serverInfo,
    database: dbStatus,
    network: addresses,
  });
};

// HTML Status Page
export const getStatusPage = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;
  const dbHost = mongoose.connection.host || "N/A";
  const dbName = mongoose.connection.name || "N/A";
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Server Status</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
    }
    .container {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      max-width: 500px;
      width: 90%;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
      font-size: 28px;
      background: linear-gradient(90deg, #00d4ff, #7b2cbf);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .status-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .status-card h2 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
      margin-bottom: 10px;
    }
    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .status-row:last-child {
      border-bottom: none;
    }
    .status-label {
      color: #aaa;
      font-size: 14px;
    }
    .status-value {
      font-weight: 600;
      font-size: 14px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge.success {
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
    }
    .badge.error {
      background: rgba(255, 68, 68, 0.2);
      color: #ff4444;
    }
    .badge.warning {
      background: rgba(255, 187, 0, 0.2);
      color: #ffbb00;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    .dot.success {
      background: #00ff88;
    }
    .dot.error {
      background: #ff4444;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .refresh-btn {
      width: 100%;
      padding: 12px;
      margin-top: 20px;
      background: linear-gradient(90deg, #00d4ff, #7b2cbf);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.3s;
    }
    .refresh-btn:hover {
      opacity: 0.9;
    }
    .timestamp {
      text-align: center;
      margin-top: 15px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🖥️ Server Status</h1>
    
    <div class="status-card">
      <h2>🌐 Server Connection</h2>
      <div class="status-row">
        <span class="status-label">Status</span>
        <span class="badge success">
          <span class="dot success"></span>
          Running
        </span>
      </div>
      <div class="status-row">
        <span class="status-label">Port</span>
        <span class="status-value">${process.env.PORT || 8080}</span>
      </div>
      <div class="status-row">
        <span class="status-label">Uptime</span>
        <span class="status-value">${formatUptime(process.uptime())}</span>
      </div>
      <div class="status-row">
        <span class="status-label">Environment</span>
        <span class="status-value">${process.env.NODE_ENV || "development"}</span>
      </div>
    </div>

    <div class="status-card">
      <h2>🗄️ Database Connection</h2>
      <div class="status-row">
        <span class="status-label">Status</span>
        <span class="badge ${isDbConnected ? 'success' : 'error'}">
          <span class="dot ${isDbConnected ? 'success' : 'error'}"></span>
          ${isDbConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <div class="status-row">
        <span class="status-label">Host</span>
        <span class="status-value">${dbHost}</span>
      </div>
      <div class="status-row">
        <span class="status-label">Database</span>
        <span class="status-value">${dbName}</span>
      </div>
    </div>

    <button class="refresh-btn" onclick="location.reload()">
      🔄 Refresh Status
    </button>
    
    <p class="timestamp">Last updated: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
};

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}
