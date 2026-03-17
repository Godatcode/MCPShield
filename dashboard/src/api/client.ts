import { mockData } from './mock'
import type {
  OverviewData,
  AuditEvent,
  ServerInfo,
  ThreatSignature,
  HoneypotAttack,
  ComplianceItem,
  ConfigData,
} from './mock'

async function fetchOrMock<T>(
  endpoint: string,
  mockFn: () => T,
  validate?: (data: unknown) => boolean,
): Promise<T> {
  try {
    const res = await fetch(`/api${endpoint}`)
    if (res.ok) {
      const data = await res.json()
      if (validate && !validate(data)) return mockFn()
      return data as T
    }
    return mockFn()
  } catch {
    return mockFn()
  }
}

const isArray = (d: unknown) => Array.isArray(d)
const isObject = (d: unknown) => d != null && typeof d === 'object' && !Array.isArray(d)

export async function getOverview(): Promise<OverviewData> {
  return fetchOrMock('/overview', () => mockData.overview, isObject)
}

export async function getEvents(): Promise<AuditEvent[]> {
  return fetchOrMock('/events', () => mockData.events, isArray)
}

export async function getServers(): Promise<ServerInfo[]> {
  return fetchOrMock('/servers', () => mockData.servers, isArray)
}

export async function getThreats(): Promise<ThreatSignature[]> {
  return fetchOrMock('/threats', () => mockData.threats, isArray)
}

export async function getHoneypotAttacks(): Promise<HoneypotAttack[]> {
  return fetchOrMock('/honeypot/attacks', () => mockData.honeypot_attacks, isArray)
}

export async function getHoneypotStatus(): Promise<{ running: boolean; uptime_hours: number; total_attacks: number }> {
  return fetchOrMock('/honeypot/status', () => mockData.honeypot_status, isObject)
}

export async function getComplianceMCP(): Promise<ComplianceItem[]> {
  return fetchOrMock('/compliance/mcp', () => mockData.owasp_mcp, isArray)
}

export async function getComplianceAgentic(): Promise<ComplianceItem[]> {
  return fetchOrMock('/compliance/agentic', () => mockData.owasp_agentic, isArray)
}

export async function getTrend(): Promise<{ hour: string; clean: number; warning: number; critical: number }[]> {
  return fetchOrMock('/trend', () => mockData.trend, isArray)
}

export async function getAuditLog(): Promise<(AuditEvent & { raw?: Record<string, unknown> })[]> {
  return fetchOrMock('/audit', () => mockData.audit, isArray)
}

export async function getConfig(): Promise<ConfigData> {
  return fetchOrMock('/config', () => mockData.config, isObject)
}

export async function triggerScan(): Promise<{ status: string; findings: number }> {
  return fetchOrMock('/scan', () => ({ status: 'completed', findings: 3 }))
}
