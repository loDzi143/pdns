export type RecordType = 'A' | 'AAAA' | 'CNAME' | 'HTTPS' | 'NS' | 'URI';
export type PeriodType = 'hours' | 'days' | 'months';
export type ViewMode = 'table' | 'chart';
export type PolicyDecision = 'allowed' | 'blocked' | 'warning' | 'nodata';
export type InputMode = 'fqdn' | 'ipv4' | 'ipv6';

export interface TimePoint {
  time: string;
  count: number;
}

export interface DNSRecord {
  id: string;
  rrdata: string;
  type: RecordType;
  resolveCount: number;
  periods: { hours: string; days: string; months: string };
  sdnsPolicy: string;
  policyDecision: PolicyDecision;
  timeSeries: { hours: TimePoint[]; days: TimePoint[]; months: TimePoint[] };
}

export interface DomainNode {
  id: string;
  fqdn: string;
  records: DNSRecord[];
  subdomains: DomainNode[];
}