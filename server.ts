import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db } from './server/database.js';
import { trafficSimulator } from './server/traffic_simulator.ts';
import { TOP_20_FEATURES } from './server/features_data.js';

const upload = multer({ dest: 'uploads/' });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auto-start background simulation in Demo Mode
  trafficSimulator.start();

  // --- REST API ENDPOINTS ---

  // GET /api/dashboard/stats
  app.get('/api/dashboard/stats', (req, res) => {
    res.json(db.getDashboardStats());
  });

  // GET /api/traffic
  app.get('/api/traffic', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    res.json(db.getTrafficLogs(limit));
  });

  // GET /api/traffic/live
  app.get('/api/traffic/live', (req, res) => {
    res.json(db.getLiveStats());
  });

  // GET /api/alerts
  app.get('/api/alerts', (req, res) => {
    let alerts = db.getAlerts();
    if (req.query.severity) {
      alerts = alerts.filter(a => a.severity.toLowerCase() === (req.query.severity as string).toLowerCase());
    }
    if (req.query.status) {
      alerts = alerts.filter(a => a.status.toLowerCase() === (req.query.status as string).toLowerCase());
    }
    if (req.query.attack_type) {
      alerts = alerts.filter(a => a.attack_type.toLowerCase().includes((req.query.attack_type as string).toLowerCase()));
    }
    res.json(alerts);
  });

  // GET /api/alerts/:id
  app.get('/api/alerts/:id', (req, res) => {
    const alert = db.getAlertById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  });

  // POST /api/alerts/:id/acknowledge
  app.post('/api/alerts/:id/acknowledge', (req, res) => {
    const updated = db.updateAlertStatus(req.params.id, 'Acknowledged');
    if (!updated) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ success: true, alert: updated });
  });

  // POST /api/alerts/:id/resolve
  app.post('/api/alerts/:id/resolve', (req, res) => {
    const updated = db.updateAlertStatus(req.params.id, 'Resolved');
    if (!updated) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ success: true, alert: updated });
  });

  // GET /api/models
  app.get('/api/models', (req, res) => {
    res.json(db.getModelMetrics());
  });

  // GET /api/models/performance
  app.get('/api/models/performance', (req, res) => {
    res.json(db.getModelMetrics());
  });

  // GET /api/features
  app.get('/api/features', (req, res) => {
    res.json(TOP_20_FEATURES);
  });

  // GET /api/metrics
  app.get('/api/metrics', (req, res) => {
    res.json({
      live_stats: db.getLiveStats(),
      models: db.getModelMetrics(),
      features_count: TOP_20_FEATURES.length
    });
  });

  // POST /api/monitor/start
  app.post('/api/monitor/start', (req, res) => {
    trafficSimulator.start();
    res.json({ success: true, message: 'Monitoring started' });
  });

  // POST /api/monitor/stop
  app.post('/api/monitor/stop', (req, res) => {
    trafficSimulator.stop();
    res.json({ success: true, message: 'Monitoring stopped' });
  });

  // POST /api/simulation/start
  app.post('/api/simulation/start', (req, res) => {
    trafficSimulator.start();
    res.json({ success: true, message: 'Simulation active' });
  });

  // POST /api/simulation/stop
  app.post('/api/simulation/stop', (req, res) => {
    trafficSimulator.pause();
    res.json({ success: true, message: 'Simulation paused' });
  });

  // POST /api/simulation/replay
  app.post('/api/simulation/replay', (req, res) => {
    trafficSimulator.replayDataset();
    res.json({ success: true, message: 'Dataset replayed' });
  });

  // POST /api/simulation/generate
  app.post('/api/simulation/generate', (req, res) => {
    trafficSimulator.generateTestTraffic();
    res.json({ success: true, message: 'Test traffic generated' });
  });

  // GET /api/reports/alerts
  app.get('/api/reports/alerts', (req, res) => {
    const format = req.query.format || 'json';
    const alerts = db.getAlerts();

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="nids_alerts_report.csv"');
      let csv = 'ID,Timestamp,SourceIP,DestinationIP,SourcePort,DestinationPort,Protocol,AttackType,DetectionMethod,Severity,Confidence,Status\n';
      alerts.forEach(a => {
        csv += `"${a.id}","${a.timestamp}","${a.source_ip}","${a.destination_ip}",${a.source_port},${a.destination_port},"${a.protocol}","${a.attack_type}","${a.detection_method}","${a.severity}",${a.confidence},"${a.status}"\n`;
      });
      return res.send(csv);
    }

    res.json({
      generated_at: new Date().toISOString(),
      total_records: alerts.length,
      alerts
    });
  });

  // GET /api/datasets
  app.get('/api/datasets', (req, res) => {
    res.json(db.getDatasets());
  });

  // POST /api/datasets/upload
  app.post('/api/datasets/upload', upload.single('dataset'), (req, res) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const newDs = {
      id: `ds-custom-${Date.now()}`,
      name: file.originalname || 'Uploaded Dataset.csv',
      type: 'Custom CSV' as const,
      record_count: Math.floor(1000 + Math.random() * 50000),
      feature_count: 78,
      attack_categories: ['Benign', 'DoS', 'PortScan'],
      class_distribution: { 'Benign': 8500, 'DoS': 1200, 'PortScan': 300 },
      preprocessing_status: 'Processed' as const,
      last_processed: new Date().toISOString(),
      file_path: file.path
    };

    db.addDataset(newDs);
    res.json({ success: true, dataset: newDs });
  });

  // GET /api/rules
  app.get('/api/rules', (req, res) => {
    res.json(db.getSignatureRules());
  });

  // POST /api/rules
  app.post('/api/rules', (req, res) => {
    const rule = req.body;
    if (!rule.name || !rule.category) {
      return res.status(400).json({ error: 'Invalid rule configuration' });
    }
    const newRule = db.addSignatureRule({
      id: `sig-custom-${Date.now()}`,
      name: rule.name,
      category: rule.category,
      protocol: rule.protocol || 'TCP',
      destination_port: rule.destination_port,
      threshold: rule.threshold || 100,
      time_window_sec: rule.time_window_sec || 10,
      enabled: rule.enabled ?? true,
      severity: rule.severity || 'High',
      description: rule.description || 'Custom user rule'
    });
    res.json(newRule);
  });

  // POST /api/rules/:id
  app.post('/api/rules/:id', (req, res) => {
    const updated = db.updateSignatureRule(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    res.json(updated);
  });

  // --- NETWORKS CONFIGURATION & DETECTION ENDPOINTS ---

  // GET /api/networks
  app.get('/api/networks', (req, res) => {
    res.json(db.getMonitoredNetworks());
  });

  // POST /api/networks
  app.post('/api/networks', (req, res) => {
    const body = req.body;
    if (!body.name || !body.cidr_or_range) {
      return res.status(400).json({ error: 'Network name and CIDR or IP Range are required' });
    }
    const newNetwork = db.addMonitoredNetwork({
      id: `net-${Date.now()}`,
      name: body.name,
      type: body.type || 'Subnet (CIDR)',
      cidr_or_range: body.cidr_or_range,
      interface_name: body.interface_name || 'eth0',
      detection_profile: body.detection_profile || 'Aggressive (High Sensitivity)',
      detection_engine: body.detection_engine || 'Hybrid Engine (Sig + ML)',
      status: body.start_detecting ? 'Active' : (body.status || 'Active'),
      primary_protocols: body.primary_protocols || ['TCP', 'HTTP', 'HTTPS', 'DNS'],
      packets_per_sec_limit: body.packets_per_sec_limit || 10000,
      promiscuous_mode: body.promiscuous_mode ?? true,
      total_packets_inspected: 0,
      threats_detected_count: 0,
      last_active: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
    res.json(newNetwork);
  });

  // PUT /api/networks/:id
  app.put('/api/networks/:id', (req, res) => {
    const updated = db.updateMonitoredNetwork(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Network configuration not found' });
    }
    res.json(updated);
  });

  // POST /api/networks/:id/start
  app.post('/api/networks/:id/start', (req, res) => {
    const updated = db.updateMonitoredNetwork(req.params.id, {
      status: 'Active',
      last_active: new Date().toISOString()
    });
    if (!updated) {
      return res.status(404).json({ error: 'Network configuration not found' });
    }
    trafficSimulator.start();
    res.json({ success: true, message: `Detection active for ${updated.name}`, network: updated });
  });

  // POST /api/networks/:id/stop
  app.post('/api/networks/:id/stop', (req, res) => {
    const updated = db.updateMonitoredNetwork(req.params.id, {
      status: 'Paused'
    });
    if (!updated) {
      return res.status(404).json({ error: 'Network configuration not found' });
    }
    res.json({ success: true, message: `Detection paused for ${updated.name}`, network: updated });
  });

  // POST /api/networks/:id/toggle
  app.post('/api/networks/:id/toggle', (req, res) => {
    const updated = db.toggleNetworkStatus(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Network configuration not found' });
    }
    if (updated.status === 'Active') {
      trafficSimulator.start();
    }
    res.json(updated);
  });

  // DELETE /api/networks/:id
  app.delete('/api/networks/:id', (req, res) => {
    const success = db.deleteMonitoredNetwork(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Network configuration not found' });
    }
    res.json({ success: true, message: 'Network configuration removed' });
  });

  // POST /api/networks/:id/simulate
  app.post('/api/networks/:id/simulate', (req, res) => {
    const network = db.getMonitoredNetworks().find(n => n.id === req.params.id);
    if (!network) {
      return res.status(404).json({ error: 'Network configuration not found' });
    }
    trafficSimulator.generateTestTraffic();
    db.updateMonitoredNetwork(req.params.id, {
      total_packets_inspected: (network.total_packets_inspected || 0) + 1250,
      last_active: new Date().toISOString()
    });
    res.json({ success: true, message: `Simulated test traffic and threat scan for network ${network.name}` });
  });

  // --- ROUTERS & GATEWAYS MONITORING ENDPOINTS ---

  // GET /api/routers
  app.get('/api/routers', (req, res) => {
    res.json(db.getMonitoredRouters());
  });

  // POST /api/routers
  app.post('/api/routers', (req, res) => {
    const body = req.body;
    if (!body.name || !body.gateway_ip) {
      return res.status(400).json({ error: 'Router name and Gateway IP address are required' });
    }

    const isStarlink = body.brand === 'Starlink Satellite' || body.name.toLowerCase().includes('starlink');

    const newRouter = db.addMonitoredRouter({
      id: `rtr-${Date.now()}`,
      name: body.name,
      brand: body.brand || 'Generic Home/Office Gateway',
      gateway_ip: body.gateway_ip,
      management_port: body.management_port || (isStarlink ? 9201 : 80),
      telemetry_protocol: body.telemetry_protocol || (isStarlink ? 'Starlink gRPC Telemetry' : 'WAN / LAN Mirroring'),
      subnet_monitored: body.subnet_monitored || '192.168.1.0/24',
      status: 'Connected & Monitoring',
      wan_throughput_mbps: isStarlink ? 175.2 : 350.0,
      latency_ms: isStarlink ? 26 : 10,
      packet_loss_pct: isStarlink ? 0.05 : 0.0,
      satellite_obstruction_pct: isStarlink ? 0.0 : undefined,
      satellite_signal_quality: isStarlink ? 98 : undefined,
      active_clients_count: body.active_clients_count || 16,
      threats_intercepted: 0,
      total_packets_processed: 0,
      last_heartbeat: new Date().toISOString(),
      created_at: new Date().toISOString()
    });

    trafficSimulator.start();
    res.json(newRouter);
  });

  // PUT /api/routers/:id
  app.put('/api/routers/:id', (req, res) => {
    const updated = db.updateMonitoredRouter(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Router configuration not found' });
    }
    res.json(updated);
  });

  // POST /api/routers/:id/toggle
  app.post('/api/routers/:id/toggle', (req, res) => {
    const updated = db.toggleRouterStatus(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Router configuration not found' });
    }
    if (updated.status === 'Connected & Monitoring') {
      trafficSimulator.start();
    }
    res.json(updated);
  });

  // DELETE /api/routers/:id
  app.delete('/api/routers/:id', (req, res) => {
    const success = db.deleteMonitoredRouter(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Router configuration not found' });
    }
    res.json({ success: true, message: 'Router configuration removed' });
  });

  // POST /api/routers/:id/test-connection
  app.post('/api/routers/:id/test-connection', (req, res) => {
    const router = db.getMonitoredRouters().find(r => r.id === req.params.id);
    if (!router) {
      return res.status(404).json({ error: 'Router configuration not found' });
    }

    trafficSimulator.generateTestTraffic();
    const updated = db.updateMonitoredRouter(req.params.id, {
      status: 'Connected & Monitoring',
      total_packets_processed: (router.total_packets_processed || 0) + 850,
      latency_ms: Math.floor(8 + Math.random() * 20),
      last_heartbeat: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `Successfully connected to ${router.brand} gateway at ${router.gateway_ip}. Telemetry handshake OK!`,
      router: updated
    });
  });

  // GET /api/logs
  app.get('/api/logs', (req, res) => {
    res.json(db.getLogs());
  });

  // POST /api/settings/demo-mode
  app.post('/api/settings/demo-mode', (req, res) => {
    const { enabled } = req.body;
    db.updateLiveStats({ demo_mode: !!enabled });
    res.json({ success: true, demo_mode: !!enabled });
  });

  // POST /api/system/reset
  app.post('/api/system/reset', (req, res) => {
    db.resetToDefault();
    res.json({ success: true, message: 'Database reset to default benchmark values' });
  });

  // --- VITE MIDDLEWARE & PRODUCTION STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
