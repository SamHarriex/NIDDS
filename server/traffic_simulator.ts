import { trafficDetector } from './traffic_detector.js';
import { db } from './database.js';

export class TrafficSimulator {
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private currentScenarioIndex: number = 0;

  private attackScenarios = [
    { type: 'Benign', protocol: 'HTTPS', port: 443, count: 14, bytes: 18400 },
    { type: 'Benign', protocol: 'DNS', port: 53, count: 2, bytes: 120 },
    { type: 'Benign', protocol: 'HTTP', port: 80, count: 8, bytes: 6400 },
    { type: 'DoS', protocol: 'TCP', port: 80, count: 650, bytes: 420000, payload: 'SYN_BURST_ATTACK' },
    { type: 'Benign', protocol: 'SSH', port: 22, count: 18, bytes: 14200 },
    { type: 'PortScan', protocol: 'TCP', port: 8080, count: 1, bytes: 64 },
    { type: 'BruteForce', protocol: 'SSH', port: 22, count: 25, bytes: 1850 },
    { type: 'WebAttack', protocol: 'HTTP', port: 80, count: 5, bytes: 3200, payload: "GET /search?id=1' UNION SELECT 1,username,password FROM users--" }
  ];

  public start() {
    if (this.isRunning && !this.isPaused) return;
    this.isRunning = true;
    this.isPaused = false;
    db.updateLiveStats({ is_running: true });
    db.addLog('application', `[INFO] Live Traffic Monitoring & Simulator Started`);

    this.timer = setInterval(() => {
      if (!this.isRunning || this.isPaused) return;
      this.generatePacket();
    }, 2000);
  }

  public pause() {
    this.isPaused = true;
    db.updateLiveStats({ is_running: false });
    db.addLog('application', `[INFO] Live Traffic Monitoring Paused`);
  }

  public stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    db.updateLiveStats({ is_running: false });
    db.addLog('application', `[INFO] Live Traffic Monitoring Stopped`);
  }

  public generateTestTraffic() {
    for (let i = 0; i < 5; i++) {
      this.generatePacket();
    }
  }

  public replayDataset() {
    db.addLog('application', `[INFO] Replaying CICIDS2017 Dataset Traffic Stream...`);
    for (let i = 0; i < 10; i++) {
      this.generatePacket();
    }
  }

  private generatePacket() {
    const scenario = this.attackScenarios[this.currentScenarioIndex % this.attackScenarios.length];
    this.currentScenarioIndex += 1;

    // Retrieve active monitored networks
    const activeNetworks = db.getMonitoredNetworks().filter(n => n.status === 'Active');
    let srcIp = scenario.type === 'Benign' ? '10.0.4.' + Math.floor(2 + Math.random() * 240) : '192.168.10.' + Math.floor(2 + Math.random() * 240);
    let dstIp = '10.0.1.100';

    if (activeNetworks.length > 0) {
      const selectedNet = activeNetworks[this.currentScenarioIndex % activeNetworks.length];
      
      // Update packet counters for this monitored network
      db.updateMonitoredNetwork(selectedNet.id, {
        total_packets_inspected: (selectedNet.total_packets_inspected || 0) + scenario.count,
        threats_detected_count: scenario.type !== 'Benign' 
          ? (selectedNet.threats_detected_count || 0) + 1 
          : selectedNet.threats_detected_count,
        last_active: new Date().toISOString()
      });

      // Construct IP based on network CIDR or range
      if (selectedNet.cidr_or_range.includes('/')) {
        const prefix = selectedNet.cidr_or_range.split('/')[0].split('.').slice(0, 3).join('.');
        srcIp = `${prefix}.${Math.floor(2 + Math.random() * 250)}`;
      } else if (selectedNet.cidr_or_range.includes('-')) {
        const firstIp = selectedNet.cidr_or_range.split('-')[0].trim();
        const prefix = firstIp.split('.').slice(0, 3).join('.');
        srcIp = `${prefix}.${Math.floor(2 + Math.random() * 250)}`;
      }
    }

    // Retrieve active monitored routers
    const activeRouters = db.getMonitoredRouters().filter(r => r.status === 'Connected & Monitoring');
    if (activeRouters.length > 0) {
      const selectedRouter = activeRouters[this.currentScenarioIndex % activeRouters.length];
      const throughputDelta = Math.round((Math.random() * 20 - 10) * 10) / 10;
      const newThroughput = Math.max(10, Math.min(1000, selectedRouter.wan_throughput_mbps + throughputDelta));

      db.updateMonitoredRouter(selectedRouter.id, {
        total_packets_processed: (selectedRouter.total_packets_processed || 0) + scenario.count,
        threats_intercepted: scenario.type !== 'Benign' 
          ? (selectedRouter.threats_intercepted || 0) + 1 
          : selectedRouter.threats_intercepted,
        wan_throughput_mbps: Math.round(newThroughput * 10) / 10,
        latency_ms: Math.max(4, Math.min(120, selectedRouter.latency_ms + Math.floor(Math.random() * 5 - 2))),
        last_heartbeat: new Date().toISOString()
      });
    }

    trafficDetector.processTraffic({
      source_ip: srcIp,
      destination_ip: dstIp,
      source_port: Math.floor(1024 + Math.random() * 60000),
      destination_port: scenario.port,
      protocol: scenario.protocol as any,
      packet_count: scenario.count,
      bytes: scenario.bytes,
      payload: scenario.payload,
      flow_duration: scenario.count > 100 ? 50 : 120000,
      flow_bytes_s: scenario.count > 100 ? 8400000 : 12000,
      flow_iat_mean: scenario.count > 100 ? 0.02 : 120
    });
  }
}

export const trafficSimulator = new TrafficSimulator();
