import { SignatureRule, TrafficLog, Alert } from '../src/types.js';
import { db } from './database.js';

interface SourceState {
  ports: Set<number>;
  portWindowStart: number;
  sshAttempts: number;
  sshWindowStart: number;
  synCount: number;
  synWindowStart: number;
}

export class SignatureEngine {
  private sourceTracker: Map<string, SourceState> = new Map();

  private getSourceState(ip: string, now: number): SourceState {
    let state = this.sourceTracker.get(ip);
    if (!state) {
      state = {
        ports: new Set<number>(),
        portWindowStart: now,
        sshAttempts: 0,
        sshWindowStart: now,
        synCount: 0,
        synWindowStart: now
      };
      this.sourceTracker.set(ip, state);
    }
    return state;
  }

  public inspect(traffic: {
    source_ip: string;
    destination_ip: string;
    source_port: number;
    destination_port: number;
    protocol: string;
    packet_count: number;
    payload?: string;
  }): { matched: boolean; rule?: SignatureRule; alert?: Partial<Alert> } {
    const rules = db.getSignatureRules().filter(r => r.enabled);
    const now = Date.now();
    const srcState = this.getSourceState(traffic.source_ip, now);

    // 1. Check SYN Flood Rule
    const synRule = rules.find(r => r.category === 'SYN Flood');
    if (synRule) {
      if (now - srcState.synWindowStart > synRule.time_window_sec * 1000) {
        srcState.synCount = 0;
        srcState.synWindowStart = now;
      }
      srcState.synCount += traffic.packet_count;

      if (
        traffic.protocol === synRule.protocol &&
        (!synRule.destination_port || traffic.destination_port === synRule.destination_port) &&
        srcState.synCount > synRule.threshold
      ) {
        return {
          matched: true,
          rule: synRule,
          alert: {
            attack_type: 'DoS Hulk',
            severity: synRule.severity,
            confidence: 100,
            description: `SYN Flood Signature Matched: ${srcState.synCount} pkts/s from ${traffic.source_ip} to port ${traffic.destination_port}`,
            explanation: `Signature Engine rule #${synRule.id} triggered. Packet rate (${srcState.synCount} pkts/s) exceeded configured threshold of ${synRule.threshold} pkts/s.`
          }
        };
      }
    }

    // 2. Check Port Scan Rule
    const portScanRule = rules.find(r => r.category === 'Port Scan');
    if (portScanRule) {
      if (now - srcState.portWindowStart > portScanRule.time_window_sec * 1000) {
        srcState.ports.clear();
        srcState.portWindowStart = now;
      }
      srcState.ports.add(traffic.destination_port);

      if (srcState.ports.size > portScanRule.threshold) {
        return {
          matched: true,
          rule: portScanRule,
          alert: {
            attack_type: 'PortScan',
            severity: portScanRule.severity,
            confidence: 100,
            description: `Port Scan Signature Matched: ${srcState.ports.size} unique ports probed by ${traffic.source_ip}`,
            explanation: `Signature Engine rule #${portScanRule.id} triggered. Source IP ${traffic.source_ip} contacted ${srcState.ports.size} unique ports within ${portScanRule.time_window_sec}s (threshold: ${portScanRule.threshold}).`
          }
        };
      }
    }

    // 3. Check Brute Force Rule
    const bruteRule = rules.find(r => r.category === 'Brute Force');
    if (bruteRule) {
      if (now - srcState.sshWindowStart > bruteRule.time_window_sec * 1000) {
        srcState.sshAttempts = 0;
        srcState.sshWindowStart = now;
      }

      if (traffic.destination_port === 22 || traffic.protocol === 'SSH') {
        srcState.sshAttempts += 1;
        if (srcState.sshAttempts > bruteRule.threshold) {
          return {
            matched: true,
            rule: bruteRule,
            alert: {
              attack_type: 'SSH-Patator',
              severity: bruteRule.severity,
              confidence: 100,
              description: `SSH Brute Force Signature Matched: ${srcState.sshAttempts} connection attempts from ${traffic.source_ip}`,
              explanation: `Signature Engine rule #${bruteRule.id} triggered. Repeated authentication attempts (${srcState.sshAttempts}) exceeded threshold ${bruteRule.threshold} in ${bruteRule.time_window_sec}s.`
            }
          };
        }
      }
    }

    // 4. Check Web Attack Rule
    const webRule = rules.find(r => r.category === 'Web Attack');
    if (webRule && traffic.payload) {
      const p = traffic.payload.toUpperCase();
      if (p.includes('UNION SELECT') || p.includes("OR '1'='1") || p.includes('<SCRIPT>') || p.includes('../..')) {
        return {
          matched: true,
          rule: webRule,
          alert: {
            attack_type: 'SQL Injection',
            severity: webRule.severity,
            confidence: 100,
            description: `Web Attack Signature Matched: Malicious injection payload detected from ${traffic.source_ip}`,
            explanation: `Signature Engine rule #${webRule.id} triggered. Web request payload contained signature matching known SQLi/XSS attack vectors.`
          }
        };
      }
    }

    return { matched: false };
  }
}

export const signatureEngine = new SignatureEngine();
