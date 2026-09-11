/**
 * NIDS Types & Data Models
 */

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
export type DetectionMethod = 'Signature' | 'Machine Learning';
export type AlertStatus = 'New' | 'Acknowledged' | 'Resolved';
export type Protocol = 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'DNS' | 'SSH';

export type AttackCategory =
  | 'Benign'
  | 'DoS'
  | 'DoS Hulk'
  | 'DoS Slowloris'
  | 'SYN Flood'
  | 'DDoS'
  | 'PortScan'
  | 'Brute Force'
  | 'SSH-Patator'
  | 'FTP-Patator'
  | 'Web Attack'
  | 'XSS'
  | 'SQL Injection'
  | 'Infiltration'
  | 'Botnet'
  | 'Other';

export interface Alert {
  id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  source_port: number;
  destination_port: number;
  protocol: Protocol;
  attack_type: AttackCategory;
  detection_method: DetectionMethod;
  severity: SeverityLevel;
  confidence: number; // 0 to 1 or 0 to 100
  status: AlertStatus;
  description: string;
  explanation: string;
}

export interface TrafficLog {
  id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  source_port: number;
  destination_port: number;
  protocol: Protocol;
  packet_count: number;
  bytes: number;
  classification: AttackCategory;
  confidence: number;
  latency_ms: number;
  is_malicious: boolean;
}

export interface ConfusionMatrixData {
  labels: string[];
  matrix: number[][]; // [actual][predicted]
  true_positives: number;
  true_negatives: number;
  false_positives: number;
  false_negatives: number;
}

export interface ROCPoint {
  fpr: number;
  tpr: number;
  threshold: number;
}

export interface ModelMetrics {
  id: string;
  dataset: string;
  model: 'Decision Tree' | 'Random Forest';
  accuracy: number; // e.g. 98.7
  precision: number; // e.g. 97.9
  recall: number; // e.g. 98.5
  f1_score: number; // e.g. 98.2
  false_positive_rate: number; // e.g. 1.8
  auc: number; // e.g. 0.994
  training_time_sec: number;
  inference_time_ms: number;
  memory_mb: number;
  created_at: string;
  confusion_matrix: ConfusionMatrixData;
  roc_curve: ROCPoint[];
}

export interface SignatureRule {
  id: string;
  name: string;
  category: 'SYN Flood' | 'Port Scan' | 'Brute Force' | 'Web Attack' | 'Custom';
  protocol: Protocol;
  destination_port?: number;
  threshold: number; // e.g. 500 pkts/sec or 100 ports or 10 login attempts
  time_window_sec: number;
  enabled: boolean;
  severity: SeverityLevel;
  description: string;
}

export interface DatasetInfo {
  id: string;
  name: string;
  type: 'CICIDS2017' | 'NSL-KDD' | 'Custom CSV';
  record_count: number;
  feature_count: number;
  attack_categories: string[];
  class_distribution: Record<string, number>;
  preprocessing_status: 'Processed' | 'Raw' | 'Processing';
  last_processed: string;
  file_path?: string;
}

export interface FeatureImportance {
  feature_name: string;
  description: string;
  gini_importance: number;
  rank: number;
  sample_value_benign: number | string;
  sample_value_attack: number | string;
}

export interface LiveStats {
  is_running: boolean;
  demo_mode: boolean;
  traffic_rate_pps: number;
  packets_processed: number;
  records_processed: number;
  threats_detected: number;
  critical_alerts_count: number;
  detection_rate_pct: number;
  avg_latency_ms: number;
  uptime_sec: number;
}

export interface DashboardStats {
  total_traffic: number;
  total_alerts: number;
  active_threats: number;
  critical_alerts: number;
  benign_traffic_pct: number;
  detection_accuracy: number;
  false_positive_rate: number;
  demo_mode: boolean;
  is_monitoring: boolean;
}

export type NetworkType = 'Subnet (CIDR)' | 'IP Range' | 'VLAN / Interface' | 'Gateway / Edge';
export type DetectionProfile = 'Aggressive (High Sensitivity)' | 'Standard Enterprise' | 'Zero Trust / Strict' | 'Passive';
export type NetworkStatus = 'Active' | 'Paused' | 'Standby';

export interface MonitoredNetwork {
  id: string;
  name: string;
  type: NetworkType;
  cidr_or_range: string;
  interface_name?: string;
  detection_profile: DetectionProfile;
  detection_engine: 'ML + Signature Pipeline' | 'Signature Only' | 'Machine Learning Anomaly' | 'Hybrid Engine (Sig + ML)';
  status: NetworkStatus;
  primary_protocols: Protocol[];
  packets_per_sec_limit?: number;
  promiscuous_mode: boolean;
  total_packets_inspected: number;
  threats_detected_count: number;
  last_active: string;
  created_at: string;
}

export type RouterBrand = 
  | 'Starlink Satellite' 
  | 'UniFi / Ubiquiti' 
  | 'MikroTik RouterOS' 
  | 'pfSense / OPNsense' 
  | 'Generic Home/Office Gateway' 
  | 'Cisco / Enterprise';

export type RouterProtocolType = 
  | 'Starlink gRPC Telemetry' 
  | 'Syslog UDP Feed' 
  | 'NetFlow / IPFIX' 
  | 'SNMP Polling (v2c/v3)' 
  | 'WAN / LAN Mirroring';

export type RouterStatus = 'Connected & Monitoring' | 'Connecting...' | 'Disconnected' | 'Paused';

export interface MonitoredRouter {
  id: string;
  name: string;
  brand: RouterBrand;
  gateway_ip: string;
  management_port?: number;
  telemetry_protocol: RouterProtocolType;
  subnet_monitored: string;
  status: RouterStatus;
  wan_throughput_mbps: number;
  latency_ms: number;
  packet_loss_pct: number;
  satellite_obstruction_pct?: number; // Starlink Dish specific
  satellite_signal_quality?: number; // Starlink Dish specific (0-100)
  active_clients_count: number;
  threats_intercepted: number;
  total_packets_processed: number;
  last_heartbeat: string;
  created_at: string;
}


