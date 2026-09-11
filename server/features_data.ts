import { FeatureImportance } from '../src/types.js';

export const TOP_20_FEATURES: FeatureImportance[] = [
  {
    rank: 1,
    feature_name: "Flow Duration",
    gini_importance: 0.142,
    description: "Total duration of the network flow in microseconds. Short flow duration with high packet count indicates DoS/Probe attacks.",
    sample_value_benign: "45,210 µs",
    sample_value_attack: "120 µs"
  },
  {
    rank: 2,
    feature_name: "Forward Packet Length Maximum",
    gini_importance: 0.118,
    description: "Maximum size of packets sent in forward direction. Large values indicate data exfiltration or payload attacks.",
    sample_value_benign: "1,460 bytes",
    sample_value_attack: "64 bytes"
  },
  {
    rank: 3,
    feature_name: "Backward Packet Length Maximum",
    gini_importance: 0.095,
    description: "Maximum size of packets sent in backward direction. Reflects server response size or HTTP web attack payloads.",
    sample_value_benign: "1,460 bytes",
    sample_value_attack: "0 bytes"
  },
  {
    rank: 4,
    feature_name: "Forward IAT Total",
    gini_importance: 0.084,
    description: "Total time between two packets sent in forward direction. Differentiates human interaction from automated botnet loops.",
    sample_value_benign: "12.4 s",
    sample_value_attack: "0.002 s"
  },
  {
    rank: 5,
    feature_name: "Flow IAT Mean",
    gini_importance: 0.076,
    description: "Mean time between two packets in the flow. Extremely low values signal rapid burst rate attacks like SYN floods.",
    sample_value_benign: "320 ms",
    sample_value_attack: "0.05 ms"
  },
  {
    rank: 6,
    feature_name: "Flow Bytes/s",
    gini_importance: 0.069,
    description: "Number of bytes transferred per second. Volumetric attacks generate extreme byte rate spikes.",
    sample_value_benign: "14,500 B/s",
    sample_value_attack: "8,500,000 B/s"
  },
  {
    rank: 7,
    feature_name: "Minimum Packet Length",
    gini_importance: 0.058,
    description: "Minimum length of a packet in flow. SYN floods and port scans rely on header-only zero-payload packets (54-64 bytes).",
    sample_value_benign: "64 bytes",
    sample_value_attack: "54 bytes"
  },
  {
    rank: 8,
    feature_name: "Subflow Forward Bytes",
    gini_importance: 0.051,
    description: "Average number of bytes in forward subflows. Used for identifying brute-force credential stuffing attempts.",
    sample_value_benign: "2,450 B",
    sample_value_attack: "310 B"
  },
  {
    rank: 9,
    feature_name: "Total Forward Packets",
    gini_importance: 0.046,
    description: "Total number of packets sent in forward direction. High count with zero response packets signifies SYN flooding.",
    sample_value_benign: "18 pkts",
    sample_value_attack: "4,500 pkts"
  },
  {
    rank: 10,
    feature_name: "Destination Port",
    gini_importance: 0.042,
    description: "Target TCP/UDP port number. Distinguishes standard Web/DNS (80/443/53) traffic from SSH/FTP probing or port scanning.",
    sample_value_benign: "443",
    sample_value_attack: "22 / 8080"
  },
  {
    rank: 11,
    feature_name: "Bwd Packet Length Mean",
    gini_importance: 0.038,
    description: "Mean size of packets in backward direction. Zero backward bytes indicates rejected connections or firewall drops.",
    sample_value_benign: "850 bytes",
    sample_value_attack: "0 bytes"
  },
  {
    rank: 12,
    feature_name: "Flow Packets/s",
    gini_importance: 0.033,
    description: "Packet transmission density per second. High packet rates characterize DDoS and port scan bursts.",
    sample_value_benign: "45 pkts/s",
    sample_value_attack: "12,000 pkts/s"
  },
  {
    rank: 13,
    feature_name: "Flow IAT Std",
    gini_importance: 0.029,
    description: "Standard deviation of flow inter-arrival time. Automated scripting displays near-zero standard deviation.",
    sample_value_benign: "145 ms",
    sample_value_attack: "0.1 ms"
  },
  {
    rank: 14,
    feature_name: "Fwd IAT Mean",
    gini_importance: 0.025,
    description: "Mean inter-arrival time between forward packets. Key metric for recognizing rate-throttled slowloris attacks.",
    sample_value_benign: "210 ms",
    sample_value_attack: "15,000 ms"
  },
  {
    rank: 15,
    feature_name: "Average Packet Size",
    gini_importance: 0.022,
    description: "Average packet size across entire bi-directional flow. Distinguishes streaming/download from command control payloads.",
    sample_value_benign: "980 bytes",
    sample_value_attack: "60 bytes"
  },
  {
    rank: 16,
    feature_name: "Bwd Header Length",
    gini_importance: 0.018,
    description: "Total bytes used for headers in backward direction. Reflects TCP handshakes and acknowledgement frames.",
    sample_value_benign: "320 bytes",
    sample_value_attack: "0 bytes"
  },
  {
    rank: 17,
    feature_name: "Fwd Header Length",
    gini_importance: 0.015,
    description: "Total header bytes sent in forward direction. Helps detect TCP option tampering and flag manipulations.",
    sample_value_benign: "400 bytes",
    sample_value_attack: "90,000 bytes"
  },
  {
    rank: 18,
    feature_name: "Init Win bytes forward",
    gini_importance: 0.013,
    description: "Initial TCP window size in forward direction. OS fingerprinting feature used to spot attack toolkits.",
    sample_value_benign: "29,200",
    sample_value_attack: "1,024"
  },
  {
    rank: 19,
    feature_name: "Subflow Bwd Bytes",
    gini_importance: 0.010,
    description: "Average backward subflow byte length. Zero or static responses signify server overload or refusal.",
    sample_value_benign: "18,400 B",
    sample_value_attack: "0 B"
  },
  {
    rank: 20,
    feature_name: "Active Mean",
    gini_importance: 0.007,
    description: "Mean time a flow was active before becoming idle. Persistent active flows are typical of SSH tunnels or HTTP keep-alive probes.",
    sample_value_benign: "1.2 s",
    sample_value_attack: "300 s"
  }
];
