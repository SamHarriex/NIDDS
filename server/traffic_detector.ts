import { Alert, TrafficLog } from '../src/types.js';
import { signatureEngine } from './signature_engine.js';
import { mlDetector } from './ml_detector.js';
import { db } from './database.js';

export interface TrafficDetectionResult {
  is_malicious: boolean;
  alert?: Alert;
  traffic_log: TrafficLog;
  detection_path: 'Signature' | 'Machine Learning' | 'Normal';
}

export class TrafficDetector {
  public processTraffic(traffic: {
    source_ip: string;
    destination_ip: string;
    source_port: number;
    destination_port: number;
    protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'DNS' | 'SSH';
    packet_count: number;
    bytes: number;
    payload?: string;
    flow_duration?: number;
    flow_bytes_s?: number;
    flow_iat_mean?: number;
  }): TrafficDetectionResult {
    const timestamp = new Date().toISOString();
    const id = `ALT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // STEP 1: Pass through Signature Engine
    const sigResult = signatureEngine.inspect(traffic);

    if (sigResult.matched && sigResult.alert) {
      const alert: Alert = {
        id,
        timestamp,
        source_ip: traffic.source_ip,
        destination_ip: traffic.destination_ip,
        source_port: traffic.source_port,
        destination_port: traffic.destination_port,
        protocol: traffic.protocol,
        attack_type: sigResult.alert.attack_type || 'DoS Hulk',
        detection_method: 'Signature',
        severity: sigResult.alert.severity || 'High',
        confidence: 100,
        status: 'New',
        description: sigResult.alert.description || 'Signature-based attack detected',
        explanation: sigResult.alert.explanation || 'Matched signature rule criteria.'
      };

      db.addAlert(alert);

      const trafficLog: TrafficLog = {
        id: `TL-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp,
        source_ip: traffic.source_ip,
        destination_ip: traffic.destination_ip,
        source_port: traffic.source_port,
        destination_port: traffic.destination_port,
        protocol: traffic.protocol,
        packet_count: traffic.packet_count,
        bytes: traffic.bytes,
        classification: alert.attack_type,
        confidence: 100,
        latency_ms: 0.08,
        is_malicious: true
      };

      db.addTrafficLog(trafficLog);

      return {
        is_malicious: true,
        alert,
        traffic_log: trafficLog,
        detection_path: 'Signature'
      };
    }

    // STEP 2: Pass through Machine Learning Engine (Random Forest)
    const mlPrediction = mlDetector.predictRandomForest({
      flow_duration: traffic.flow_duration || 120,
      fwd_packet_length_max: Math.round(traffic.bytes / Math.max(1, traffic.packet_count)),
      bwd_packet_length_max: 0,
      flow_iat_mean: traffic.flow_iat_mean || 0.1,
      flow_bytes_s: traffic.flow_bytes_s || (traffic.bytes * 10),
      destination_port: traffic.destination_port,
      subflow_fwd_bytes: traffic.bytes,
      total_fwd_packets: traffic.packet_count,
      min_packet_length: 54
    });

    if (mlPrediction.is_malicious) {
      const alert: Alert = {
        id,
        timestamp,
        source_ip: traffic.source_ip,
        destination_ip: traffic.destination_ip,
        source_port: traffic.source_port,
        destination_port: traffic.destination_port,
        protocol: traffic.protocol,
        attack_type: mlPrediction.predicted_class,
        detection_method: 'Machine Learning',
        severity: mlPrediction.confidence > 95 ? 'High' : 'Medium',
        confidence: mlPrediction.confidence,
        status: 'New',
        description: `ML Anomaly Detected: ${mlPrediction.predicted_class} flow anomaly from ${traffic.source_ip}`,
        explanation: `Random Forest ensemble classified traffic as ${mlPrediction.predicted_class} with ${mlPrediction.confidence}% confidence based on flow rate (${traffic.flow_bytes_s || 500000} B/s) and packet density.`
      };

      db.addAlert(alert);

      const trafficLog: TrafficLog = {
        id: `TL-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp,
        source_ip: traffic.source_ip,
        destination_ip: traffic.destination_ip,
        source_port: traffic.source_port,
        destination_port: traffic.destination_port,
        protocol: traffic.protocol,
        packet_count: traffic.packet_count,
        bytes: traffic.bytes,
        classification: alert.attack_type,
        confidence: mlPrediction.confidence,
        latency_ms: 0.14,
        is_malicious: true
      };

      db.addTrafficLog(trafficLog);

      return {
        is_malicious: true,
        alert,
        traffic_log: trafficLog,
        detection_path: 'Machine Learning'
      };
    }

    // STEP 3: Traffic is Normal/Benign
    const trafficLog: TrafficLog = {
      id: `TL-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp,
      source_ip: traffic.source_ip,
      destination_ip: traffic.destination_ip,
      source_port: traffic.source_port,
      destination_port: traffic.destination_port,
      protocol: traffic.protocol,
      packet_count: traffic.packet_count,
      bytes: traffic.bytes,
      classification: 'Benign',
      confidence: 99.8,
      latency_ms: 0.05,
      is_malicious: false
    };

    db.addTrafficLog(trafficLog);

    return {
      is_malicious: false,
      traffic_log: trafficLog,
      detection_path: 'Normal'
    };
  }
}

export const trafficDetector = new TrafficDetector();
export const hybridDetector = trafficDetector;
