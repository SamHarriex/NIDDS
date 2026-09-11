import fs from 'fs';
import path from 'path';
import {
  Alert,
  TrafficLog,
  ModelMetrics,
  SignatureRule,
  DatasetInfo,
  DashboardStats,
  LiveStats,
  ConfusionMatrixData,
  ROCPoint,
  MonitoredNetwork,
  MonitoredRouter
} from '../src/types.js';
import { TOP_20_FEATURES } from './features_data.js';

const DB_DIR = path.join(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'nids_data.json');
const LOGS_DIR = path.join(process.cwd(), 'logs');

export interface DBState {
  alerts: Alert[];
  traffic_logs: TrafficLog[];
  model_metrics: ModelMetrics[];
  signature_rules: SignatureRule[];
  datasets: DatasetInfo[];
  monitored_networks: MonitoredNetwork[];
  monitored_routers: MonitoredRouter[];
  logs: {
    application: string[];
    detection: string[];
    errors: string[];
  };
  live_stats: LiveStats;
}

// Initial seed values matching CICIDS2017 baseline performance reported in thesis
const SEED_MODEL_METRICS: ModelMetrics[] = [
  {
    id: 'mm-cicids-dt',
    dataset: 'CICIDS2017',
    model: 'Decision Tree',
    accuracy: 97.1,
    precision: 96.4,
    recall: 97.0,
    f1_score: 96.7,
    false_positive_rate: 2.9,
    auc: 0.965,
    training_time_sec: 4.82,
    inference_time_ms: 0.42,
    memory_mb: 128,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    confusion_matrix: {
      labels: ['Benign', 'DoS', 'DDoS', 'PortScan', 'BruteForce', 'WebAttack'],
      matrix: [
        [18420, 120, 45, 110, 30, 25],
        [85, 4120, 60, 10, 15, 0],
        [30, 40, 3850, 5, 0, 0],
        [90, 15, 10, 2410, 5, 0],
        [40, 5, 0, 10, 1180, 5],
        [35, 0, 0, 0, 10, 895]
      ],
      true_positives: 12455,
      true_negatives: 18420,
      false_positives: 330,
      false_negatives: 385
    },
    roc_curve: [
      { fpr: 0, tpr: 0, threshold: 1.0 },
      { fpr: 0.01, tpr: 0.88, threshold: 0.9 },
      { fpr: 0.029, tpr: 0.970, threshold: 0.5 },
      { fpr: 0.08, tpr: 0.985, threshold: 0.3 },
      { fpr: 0.25, tpr: 0.995, threshold: 0.1 },
      { fpr: 1.0, tpr: 1.0, threshold: 0.0 }
    ]
  },
  {
    id: 'mm-cicids-rf',
    dataset: 'CICIDS2017',
    model: 'Random Forest',
    accuracy: 98.7,
    precision: 97.9,
    recall: 98.5,
    f1_score: 98.2,
    false_positive_rate: 1.8,
    auc: 0.994,
    training_time_sec: 14.35,
    inference_time_ms: 0.18,
    memory_mb: 256,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    confusion_matrix: {
      labels: ['Benign', 'DoS', 'DDoS', 'PortScan', 'BruteForce', 'WebAttack'],
      matrix: [
        [18580, 60, 20, 50, 15, 15],
        [30, 4210, 20, 5, 5, 0],
        [15, 20, 3880, 0, 0, 0],
        [40, 5, 5, 2470, 0, 0],
        [15, 0, 0, 5, 1210, 0],
        [10, 0, 0, 0, 5, 925]
      ],
      true_positives: 12700,
      true_negatives: 18580,
      false_positives: 160,
      false_negatives: 190
    },
    roc_curve: [
      { fpr: 0, tpr: 0, threshold: 1.0 },
      { fpr: 0.005, tpr: 0.94, threshold: 0.9 },
      { fpr: 0.018, tpr: 0.985, threshold: 0.5 },
      { fpr: 0.04, tpr: 0.995, threshold: 0.3 },
      { fpr: 0.15, tpr: 0.999, threshold: 0.1 },
      { fpr: 1.0, tpr: 1.0, threshold: 0.0 }
    ]
  }
];

const SEED_DATASETS: DatasetInfo[] = [
  {
    id: 'ds-cicids2017',
    name: 'CICIDS2017 Campus Benchmark',
    type: 'CICIDS2017',
    record_count: 2830743,
    feature_count: 78,
    attack_categories: ['Benign', 'DoS Hulk', 'DoS GoldenEye', 'DoS Slowloris', 'DDoS', 'PortScan', 'SSH-Patator', 'FTP-Patator', 'Web Attack - XSS', 'Infiltration', 'Botnet'],
    class_distribution: {
      'Benign': 2273097,
      'DoS': 252661,
      'PortScan': 158930,
      'DDoS': 128027,
      'Brute Force': 13835,
      'Web Attack': 2180,
      'Botnet': 1966,
      'Infiltration': 47
    },
    preprocessing_status: 'Processed',
    last_processed: new Date(Date.now() - 86400000 * 2).toISOString(),
    file_path: 'data/cicids2017/GeneratedLabelledFlows.csv'
  },
  {
    id: 'ds-nsl-kdd',
    name: 'NSL-KDD Evaluation Set',
    type: 'NSL-KDD',
    record_count: 148517,
    feature_count: 41,
    attack_categories: ['Benign', 'DoS', 'Probe', 'R2L', 'U2R'],
    class_distribution: {
      'Benign': 77054,
      'DoS': 53387,
      'Probe': 14077,
      'R2L': 3749,
      'U2R': 250
    },
    preprocessing_status: 'Processed',
    last_processed: new Date(Date.now() - 86400000 * 5).toISOString(),
    file_path: 'data/nsl_kdd/KDDTrain+.txt'
  }
];

const SEED_ALERTS: Alert[] = [
  {
    id: 'ALT-1001',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    source_ip: '192.168.10.45',
    destination_ip: '10.0.1.100',
    source_port: 49812,
    destination_port: 80,
    protocol: 'TCP',
    attack_type: 'DoS Hulk',
    detection_method: 'Signature',
    severity: 'High',
    confidence: 100,
    status: 'New',
    description: 'High packet rate SYN burst targeting Web Server (10.0.1.100:80)',
    explanation: 'Triggered SYN Flood Signature Rule #sig-001: Packet rate exceeded 500 pkts/sec threshold (measured 740 pkts/s) with TCP flags SYN set.'
  },
  {
    id: 'ALT-1002',
    timestamp: new Date(Date.now() - 340000).toISOString(),
    source_ip: '172.16.4.12',
    destination_ip: '10.0.2.15',
    source_port: 52104,
    destination_port: 22,
    protocol: 'SSH',
    attack_type: 'SSH-Patator',
    detection_method: 'Machine Learning',
    severity: 'High',
    confidence: 98.4,
    status: 'Acknowledged',
    description: 'Repeated failed SSH credential authentication attempts from student lab host',
    explanation: 'Signature Rule #sig-003 detected >10 connection attempts in 60s, reinforced by Random Forest ML prediction (Subflow Fwd Bytes = 310B, Init Win bytes = 1024).'
  },
  {
    id: 'ALT-1003',
    timestamp: new Date(Date.now() - 620000).toISOString(),
    source_ip: '10.0.5.88',
    destination_ip: '10.0.1.1',
    source_port: 38910,
    destination_port: 8080,
    protocol: 'TCP',
    attack_type: 'PortScan',
    detection_method: 'Signature',
    severity: 'Medium',
    confidence: 100,
    status: 'New',
    description: 'Rapid sequential port sweep across campus core gateway',
    explanation: 'Triggered Port Scan Signature Rule #sig-002: Contacted 142 unique destination ports within 6.2 seconds.'
  },
  {
    id: 'ALT-1004',
    timestamp: new Date(Date.now() - 1100000).toISOString(),
    source_ip: '198.51.100.14',
    destination_ip: '10.0.1.20',
    source_port: 60124,
    destination_port: 80,
    protocol: 'HTTP',
    attack_type: 'SQL Injection',
    detection_method: 'Signature',
    severity: 'Critical',
    confidence: 100,
    status: 'New',
    description: 'SQLi pattern injection detected in web application parameter string',
    explanation: 'Triggered Signature Rule #sig-004: HTTP payload inspection matched standard injection string UNION SELECT ALL FROM information_schema.'
  },
  {
    id: 'ALT-1005',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    source_ip: '192.168.10.112',
    destination_ip: '10.0.3.50',
    source_port: 44102,
    destination_port: 443,
    protocol: 'HTTPS',
    attack_type: 'Infiltration',
    detection_method: 'Machine Learning',
    severity: 'Medium',
    confidence: 94.2,
    status: 'Resolved',
    description: 'Anomaly detected in encrypted SSL flow duration and inter-arrival time pattern',
    explanation: 'Random Forest anomaly model flagged suspicious flow characteristics: Flow Duration = 120µs, Flow IAT Mean = 0.05ms, differing significantly from standard HTTPS baseline.'
  }
];

const SEED_MONITORED_NETWORKS: MonitoredNetwork[] = [
  {
    id: 'net-001',
    name: 'Main Campus Core Network Subnet',
    type: 'Subnet (CIDR)',
    cidr_or_range: '10.0.1.0/24',
    interface_name: 'eth0',
    detection_profile: 'Aggressive (High Sensitivity)',
    detection_engine: 'ML + Signature Pipeline',
    status: 'Active',
    primary_protocols: ['TCP', 'HTTP', 'HTTPS', 'DNS', 'SSH'],
    packets_per_sec_limit: 10000,
    promiscuous_mode: true,
    total_packets_inspected: 1284900,
    threats_detected_count: 32,
    last_active: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'net-002',
    name: 'Student Wi-Fi & Dormitory Network',
    type: 'VLAN / Interface',
    cidr_or_range: '172.16.0.0/12',
    interface_name: 'wlan0',
    detection_profile: 'Standard Enterprise',
    detection_engine: 'ML + Signature Pipeline',
    status: 'Active',
    primary_protocols: ['TCP', 'UDP', 'HTTP', 'HTTPS'],
    packets_per_sec_limit: 5000,
    promiscuous_mode: true,
    total_packets_inspected: 842100,
    threats_detected_count: 14,
    last_active: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: 'net-003',
    name: 'Computer Science Research Lab LAN',
    type: 'IP Range',
    cidr_or_range: '192.168.10.1 - 192.168.10.254',
    interface_name: 'vlan20',
    detection_profile: 'Zero Trust / Strict',
    detection_engine: 'ML + Signature Pipeline',
    status: 'Active',
    primary_protocols: ['TCP', 'SSH', 'HTTP', 'ICMP'],
    packets_per_sec_limit: 2000,
    promiscuous_mode: false,
    total_packets_inspected: 491200,
    threats_detected_count: 8,
    last_active: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'net-004',
    name: 'External Cloud DMZ Gateway',
    type: 'Gateway / Edge',
    cidr_or_range: '198.51.100.0/24',
    interface_name: 'eth1',
    detection_profile: 'Aggressive (High Sensitivity)',
    detection_engine: 'Signature Only',
    status: 'Standby',
    primary_protocols: ['TCP', 'HTTPS', 'HTTP'],
    packets_per_sec_limit: 15000,
    promiscuous_mode: true,
    total_packets_inspected: 120500,
    threats_detected_count: 4,
    last_active: new Date(Date.now() - 3600000 * 2).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

const SEED_MONITORED_ROUTERS: MonitoredRouter[] = [
  {
    id: 'rtr-starlink-01',
    name: 'Starlink Gen2 Dishy Gateway',
    brand: 'Starlink Satellite',
    gateway_ip: '192.168.100.1',
    management_port: 9201,
    telemetry_protocol: 'Starlink gRPC Telemetry',
    subnet_monitored: '192.168.1.0/24',
    status: 'Connected & Monitoring',
    wan_throughput_mbps: 185.4,
    latency_ms: 27,
    packet_loss_pct: 0.08,
    satellite_obstruction_pct: 0.0,
    satellite_signal_quality: 99,
    active_clients_count: 24,
    threats_intercepted: 11,
    total_packets_processed: 1492000,
    last_heartbeat: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: 'rtr-unifi-02',
    name: 'UniFi Dream Machine Pro Gateway',
    brand: 'UniFi / Ubiquiti',
    gateway_ip: '192.168.1.1',
    management_port: 2055,
    telemetry_protocol: 'NetFlow / IPFIX',
    subnet_monitored: '192.168.1.0/24',
    status: 'Connected & Monitoring',
    wan_throughput_mbps: 420.0,
    latency_ms: 12,
    packet_loss_pct: 0.0,
    active_clients_count: 58,
    threats_intercepted: 23,
    total_packets_processed: 2840000,
    last_heartbeat: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'rtr-pfsense-03',
    name: 'pfSense Firewall Core Router',
    brand: 'pfSense / OPNsense',
    gateway_ip: '10.0.0.1',
    management_port: 514,
    telemetry_protocol: 'Syslog UDP Feed',
    subnet_monitored: '10.0.0.0/16',
    status: 'Connected & Monitoring',
    wan_throughput_mbps: 890.5,
    latency_ms: 6,
    packet_loss_pct: 0.0,
    active_clients_count: 142,
    threats_intercepted: 45,
    total_packets_processed: 5120000,
    last_heartbeat: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000 * 45).toISOString()
  },
  {
    id: 'rtr-home-04',
    name: 'Office Main Gateway (Asus / Netgear)',
    brand: 'Generic Home/Office Gateway',
    gateway_ip: '192.168.0.1',
    management_port: 80,
    telemetry_protocol: 'WAN / LAN Mirroring',
    subnet_monitored: '192.168.0.0/24',
    status: 'Connected & Monitoring',
    wan_throughput_mbps: 94.2,
    latency_ms: 16,
    packet_loss_pct: 0.15,
    active_clients_count: 14,
    threats_intercepted: 6,
    total_packets_processed: 640000,
    last_heartbeat: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000 * 10).toISOString()
  }
];

class DatabaseManager {
  private state: DBState;

  constructor() {
    this.ensureDirectories();
    this.state = this.loadState();
  }

  private ensureDirectories() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
  }

  private loadState(): DBState {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.model_metrics) {
          parsed.model_metrics = parsed.model_metrics.filter((m: any) => m.model !== 'Hybrid');
        }
        if (parsed.alerts) {
          parsed.alerts.forEach((a: any) => {
            if (a.detection_method === 'Hybrid') a.detection_method = 'Machine Learning';
          });
        }
        if (parsed.monitored_networks) {
          parsed.monitored_networks.forEach((n: any) => {
            if (n.detection_engine === 'Hybrid Engine (Sig + ML)') {
              n.detection_engine = 'ML + Signature Pipeline';
            }
          });
        }
        if (!parsed.monitored_networks) {
          parsed.monitored_networks = SEED_MONITORED_NETWORKS;
        }
        if (!parsed.monitored_routers) {
          parsed.monitored_routers = SEED_MONITORED_ROUTERS;
        }
        if (parsed.live_stats && parsed.live_stats.detection_rate_pct === 99.1) {
          parsed.live_stats.detection_rate_pct = 98.7;
        }
        return parsed;
      } catch (err) {
        console.error('Error reading DB_FILE, creating fresh instance:', err);
      }
    }

    // Load signature rules from rules/signatures.json
    let defaultRules: SignatureRule[] = [];
    const sigPath = path.join(process.cwd(), 'rules', 'signatures.json');
    if (fs.existsSync(sigPath)) {
      try {
        defaultRules = JSON.parse(fs.readFileSync(sigPath, 'utf-8'));
      } catch (err) {
        console.error('Error loading signatures.json:', err);
      }
    }

    const initialState: DBState = {
      alerts: SEED_ALERTS,
      traffic_logs: this.generateInitialTrafficLogs(),
      model_metrics: SEED_MODEL_METRICS,
      signature_rules: defaultRules,
      datasets: SEED_DATASETS,
      monitored_networks: SEED_MONITORED_NETWORKS,
      monitored_routers: SEED_MONITORED_ROUTERS,
      logs: {
        application: [
          `[${new Date().toISOString()}] [INFO] NIDS Engine initialized in Demo Mode`,
          `[${new Date().toISOString()}] [INFO] Loaded Random Forest model (Accuracy 98.7%, AUC 0.994)`,
          `[${new Date().toISOString()}] [INFO] Loaded Signature Engine with ${defaultRules.length} active rules`
        ],
        detection: [
          `[${new Date().toISOString()}] [DETECTION] Signature match sig-001 on 192.168.10.45 -> DoS Hulk`,
          `[${new Date().toISOString()}] [DETECTION] ML alert ALT-1002 on 172.16.4.12 -> SSH-Patator`
        ],
        errors: []
      },
      live_stats: {
        is_running: true,
        demo_mode: true,
        traffic_rate_pps: 1240,
        packets_processed: 1284392,
        records_processed: 84210,
        threats_detected: 4821,
        critical_alerts_count: 37,
        detection_rate_pct: 98.7,
        avg_latency_ms: 0.14,
        uptime_sec: 1420
      }
    };

    this.saveState(initialState);
    return initialState;
  }

  public saveState(state: DBState = this.state) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
      this.writeLogFiles();
    } catch (err) {
      console.error('Error writing DB_FILE:', err);
    }
  }

  private writeLogFiles() {
    try {
      fs.writeFileSync(path.join(LOGS_DIR, 'application.log'), this.state.logs.application.join('\n'));
      fs.writeFileSync(path.join(LOGS_DIR, 'detection.log'), this.state.logs.detection.join('\n'));
      fs.writeFileSync(path.join(LOGS_DIR, 'errors.log'), this.state.logs.errors.join('\n'));
    } catch (err) {
      console.error('Error writing log files:', err);
    }
  }

  private generateInitialTrafficLogs(): TrafficLog[] {
    const logs: TrafficLog[] = [];
    const now = Date.now();
    const categories: { cat: any; is_malicious: boolean }[] = [
      { cat: 'Benign', is_malicious: false },
      { cat: 'Benign', is_malicious: false },
      { cat: 'Benign', is_malicious: false },
      { cat: 'DoS Hulk', is_malicious: true },
      { cat: 'Benign', is_malicious: false },
      { cat: 'PortScan', is_malicious: true },
      { cat: 'Benign', is_malicious: false },
      { cat: 'SSH-Patator', is_malicious: true },
      { cat: 'Benign', is_malicious: false },
      { cat: 'SQL Injection', is_malicious: true }
    ];

    for (let i = 0; i < 60; i++) {
      const item = categories[i % categories.length];
      const time = new Date(now - (60 - i) * 10000).toISOString();
      logs.push({
        id: `TL-${1000 + i}`,
        timestamp: time,
        source_ip: item.is_malicious ? `192.168.10.${(i * 7) % 250 + 10}` : `10.0.4.${(i * 3) % 250 + 2}`,
        destination_ip: '10.0.1.100',
        source_port: 30000 + (i * 123) % 30000,
        destination_port: item.cat === 'SSH-Patator' ? 22 : 80,
        protocol: item.cat === 'SSH-Patator' ? 'SSH' : 'TCP',
        packet_count: item.is_malicious ? 450 + (i * 10) : 12 + (i % 5),
        bytes: item.is_malicious ? 482000 : 14200,
        classification: item.cat,
        confidence: item.is_malicious ? 98.5 : 99.8,
        latency_ms: 0.12 + (i % 10) * 0.01,
        is_malicious: item.is_malicious
      });
    }
    return logs;
  }

  // --- API METHODS ---

  public getDashboardStats(): DashboardStats {
    const totalTraffic = this.state.live_stats.packets_processed;
    const totalAlerts = this.state.alerts.length;
    const activeThreats = this.state.alerts.filter(a => a.status !== 'Resolved').length;
    const criticalAlerts = this.state.alerts.filter(a => a.severity === 'Critical').length;
    
    return {
      total_traffic: totalTraffic,
      total_alerts: totalAlerts,
      active_threats: activeThreats,
      critical_alerts: criticalAlerts,
      benign_traffic_pct: 96.8,
      detection_accuracy: 99.1,
      false_positive_rate: 1.3,
      demo_mode: this.state.live_stats.demo_mode,
      is_monitoring: this.state.live_stats.is_running
    };
  }

  public getLiveStats(): LiveStats {
    return { ...this.state.live_stats };
  }

  public updateLiveStats(partial: Partial<LiveStats>) {
    this.state.live_stats = { ...this.state.live_stats, ...partial };
    this.saveState();
  }

  public getAlerts(): Alert[] {
    return [...this.state.alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getAlertById(id: string): Alert | undefined {
    return this.state.alerts.find(a => a.id === id);
  }

  public addAlert(alert: Alert) {
    if (this.state.alerts.some(a => a.id === alert.id)) {
      alert.id = `${alert.id}-${Math.floor(Math.random() * 10000)}`;
    }
    this.state.alerts.unshift(alert);
    this.state.live_stats.threats_detected += 1;
    if (alert.severity === 'Critical') {
      this.state.live_stats.critical_alerts_count += 1;
    }
    this.addLog('detection', `[DETECTION] ${alert.detection_method} triggered alert ${alert.id} (${alert.attack_type}) from ${alert.source_ip}`);
    this.saveState();
  }

  public updateAlertStatus(id: string, status: 'Acknowledged' | 'Resolved'): Alert | null {
    const alert = this.state.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = status;
      this.addLog('application', `[INFO] Alert ${id} status changed to ${status}`);
      this.saveState();
      return alert;
    }
    return null;
  }

  public getTrafficLogs(limit = 100): TrafficLog[] {
    return this.state.traffic_logs.slice(-limit).reverse();
  }

  public addTrafficLog(log: TrafficLog) {
    this.state.traffic_logs.push(log);
    if (this.state.traffic_logs.length > 500) {
      this.state.traffic_logs.shift();
    }
    this.state.live_stats.packets_processed += log.packet_count;
    this.state.live_stats.records_processed += 1;
    this.saveState();
  }

  public getModelMetrics(): ModelMetrics[] {
    return this.state.model_metrics;
  }

  public getSignatureRules(): SignatureRule[] {
    return this.state.signature_rules;
  }

  public updateSignatureRule(id: string, partial: Partial<SignatureRule>): SignatureRule | null {
    const rule = this.state.signature_rules.find(r => r.id === id);
    if (rule) {
      Object.assign(rule, partial);
      this.addLog('application', `[INFO] Signature rule ${id} updated: ${JSON.stringify(partial)}`);
      this.saveState();
      return rule;
    }
    return null;
  }

  public addSignatureRule(rule: SignatureRule): SignatureRule {
    this.state.signature_rules.push(rule);
    this.addLog('application', `[INFO] New signature rule added: ${rule.name}`);
    this.saveState();
    return rule;
  }

  public getDatasets(): DatasetInfo[] {
    return this.state.datasets;
  }

  public addDataset(dataset: DatasetInfo) {
    this.state.datasets.push(dataset);
    this.saveState();
  }

  // --- MONITORED NETWORKS METHODS ---
  public getMonitoredNetworks(): MonitoredNetwork[] {
    return this.state.monitored_networks || [];
  }

  public addMonitoredNetwork(net: MonitoredNetwork): MonitoredNetwork {
    if (!this.state.monitored_networks) {
      this.state.monitored_networks = [];
    }
    this.state.monitored_networks.push(net);
    this.addLog('application', `[INFO] Configured new network for threat detection: ${net.name} (${net.cidr_or_range})`);
    this.saveState();
    return net;
  }

  public updateMonitoredNetwork(id: string, partial: Partial<MonitoredNetwork>): MonitoredNetwork | null {
    const net = (this.state.monitored_networks || []).find(n => n.id === id);
    if (net) {
      Object.assign(net, partial);
      this.addLog('application', `[INFO] Updated network detection parameters for ${net.name} (${id})`);
      this.saveState();
      return net;
    }
    return null;
  }

  public deleteMonitoredNetwork(id: string): boolean {
    if (!this.state.monitored_networks) return false;
    const initialLen = this.state.monitored_networks.length;
    this.state.monitored_networks = this.state.monitored_networks.filter(n => n.id !== id);
    if (this.state.monitored_networks.length < initialLen) {
      this.addLog('application', `[INFO] Removed network configuration ${id}`);
      this.saveState();
      return true;
    }
    return false;
  }

  public toggleNetworkStatus(id: string): MonitoredNetwork | null {
    const net = (this.state.monitored_networks || []).find(n => n.id === id);
    if (net) {
      net.status = net.status === 'Active' ? 'Paused' : 'Active';
      net.last_active = new Date().toISOString();
      this.addLog('application', `[INFO] Network ${net.name} detection status toggled to: ${net.status}`);
      this.saveState();
      return net;
    }
    return null;
  }

  // --- MONITORED ROUTERS METHODS ---
  public getMonitoredRouters(): MonitoredRouter[] {
    return this.state.monitored_routers || [];
  }

  public addMonitoredRouter(router: MonitoredRouter): MonitoredRouter {
    if (!this.state.monitored_routers) {
      this.state.monitored_routers = [];
    }
    this.state.monitored_routers.push(router);
    this.addLog('application', `[INFO] Configured and connected router telemetry: ${router.name} (${router.brand}) @ ${router.gateway_ip}`);
    this.saveState();
    return router;
  }

  public updateMonitoredRouter(id: string, partial: Partial<MonitoredRouter>): MonitoredRouter | null {
    const rtr = (this.state.monitored_routers || []).find(r => r.id === id);
    if (rtr) {
      Object.assign(rtr, partial);
      this.addLog('application', `[INFO] Updated router telemetry settings for ${rtr.name} (${id})`);
      this.saveState();
      return rtr;
    }
    return null;
  }

  public deleteMonitoredRouter(id: string): boolean {
    if (!this.state.monitored_routers) return false;
    const initialLen = this.state.monitored_routers.length;
    this.state.monitored_routers = this.state.monitored_routers.filter(r => r.id !== id);
    if (this.state.monitored_routers.length < initialLen) {
      this.addLog('application', `[INFO] Disconnected and removed router configuration ${id}`);
      this.saveState();
      return true;
    }
    return false;
  }

  public toggleRouterStatus(id: string): MonitoredRouter | null {
    const rtr = (this.state.monitored_routers || []).find(r => r.id === id);
    if (rtr) {
      rtr.status = rtr.status === 'Connected & Monitoring' ? 'Paused' : 'Connected & Monitoring';
      rtr.last_heartbeat = new Date().toISOString();
      this.addLog('application', `[INFO] Router ${rtr.name} monitoring status changed to: ${rtr.status}`);
      this.saveState();
      return rtr;
    }
    return null;
  }

  public getLogs() {
    return this.state.logs;
  }

  public addLog(type: 'application' | 'detection' | 'errors', message: string) {
    if (this.state.logs[type]) {
      this.state.logs[type].push(message);
      if (this.state.logs[type].length > 200) {
        this.state.logs[type].shift();
      }
      this.saveState();
    }
  }

  public resetToDefault() {
    this.state.alerts = SEED_ALERTS;
    this.state.traffic_logs = this.generateInitialTrafficLogs();
    this.state.model_metrics = SEED_MODEL_METRICS;
    this.state.datasets = SEED_DATASETS;
    this.state.monitored_networks = SEED_MONITORED_NETWORKS;
    this.saveState();
  }
}

export const db = new DatabaseManager();
