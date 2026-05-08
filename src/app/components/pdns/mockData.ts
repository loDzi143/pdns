import { DomainNode, DNSRecord } from './types';

const H = (time: string, count: number) => ({ time, count });
const hourLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00, 1 дек.`);
const dayLabels = ['21 нояб.','22 нояб.','23 нояб.','24 нояб.','25 нояб.','26 нояб.','27 нояб.','28 нояб.','29 нояб.','30 нояб.','1 дек.','2 дек.','3 дек.','4 дек.'];
const monthLabels = ['янв. 2025','февр. 2025','март 2025','апр. 2025','май 2025','июнь 2025','июль 2025','авг. 2025','сент. 2025','окт. 2025','нояб. 2025','дек. 2025'];

const ts = (labels: string[], counts: number[]) => labels.map((time, i) => H(time, counts[i] ?? 0));

const rec1: DNSRecord = {
  id: 'r1', rrdata: '93.184.216.34', type: 'A', resolveCount: 1247,
  periods: { hours: '15:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [5,3,2,2,3,8,15,35,62,78,85,91,88,79,82,76,65,45,32,21,15,12,8,6]),
    days: ts(dayLabels,  [1247,1189,1312,1156,1289,1423,1234,1156,1312,1289,1198,1345,1267,1089]),
    months: ts(monthLabels, [28934,26789,31234,29456,32123,33456,31234,30123,33456,34567,32123,31234]),
  }
};

const rec2: DNSRecord = {
  id: 'r2', rrdata: '2606:2800:220:1:248:1893:25c8:1946', type: 'AAAA', resolveCount: 843,
  periods: { hours: '14:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [3,2,2,1,2,5,11,24,43,54,59,63,61,55,57,52,45,31,22,15,10,8,5,4]),
    days: ts(dayLabels,  [843,812,889,798,867,923,845,798,867,845,812,889,834,756,]),
    months: ts(monthLabels, [19456,18234,21345,19876,22134,23456,21234,20345,23456,24567,22134,21234]),
  }
};

const rec3: DNSRecord = {
  id: 'r3', rrdata: 'ns1.example.com', type: 'NS', resolveCount: 234,
  periods: { hours: '10:00, 1 дек.', days: '3 дек. 2025', months: 'окт. 2025' },
  sdnsPolicy: 'Мониторинг', policyDecision: 'allowed',
  timeSeries: {
    hours: ts(hourLabels, [12,10,9,8,10,14,22,28,32,34,33,35,34,32,33,31,28,24,20,17,15,14,13,12]),
    days: ts(dayLabels,  [234,221,247,213,239,256,234,213,247,239,225,256,243,212]),
    months: ts(monthLabels, [5234,4989,5456,5123,5512,5789,5456,5345,5789,6012,5678,5456]),
  }
};

const rec4: DNSRecord = {
  id: 'r4', rrdata: 'ns2.example.com', type: 'NS', resolveCount: 189,
  periods: { hours: '10:00, 1 дек.', days: '3 дек. 2025', months: 'окт. 2025' },
  sdnsPolicy: 'Мониторинг', policyDecision: 'allowed',
  timeSeries: {
    hours: ts(hourLabels, [9,8,7,6,8,11,18,22,26,28,27,29,28,26,27,25,23,20,16,14,12,11,10,9]),
    days: ts(dayLabels,  [189,181,199,174,194,207,190,174,199,194,183,207,197,173]),
    months: ts(monthLabels, [4234,4089,4456,4123,4512,4789,4456,4345,4789,5012,4678,4456]),
  }
};

const recWwwA: DNSRecord = {
  id: 'r5', rrdata: '93.184.216.34', type: 'A', resolveCount: 5892,
  periods: { hours: '16:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [89,67,54,48,56,112,234,489,567,623,645,678,662,634,651,612,534,423,334,267,198,156,123,98]),
    days: ts(dayLabels,  [5892,5634,6123,5456,5878,6456,5891,5456,6123,5878,5634,6456,5978,5312]),
    months: ts(monthLabels, [128934,121789,136234,123456,131123,143456,131234,128123,143456,152567,141123,136234]),
  }
};

const recWwwCname: DNSRecord = {
  id: 'r6', rrdata: 'example.com', type: 'CNAME', resolveCount: 312,
  periods: { hours: '12:00, 1 дек.', days: '2 дек. 2025', months: 'окт. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [15,12,10,9,11,19,35,62,78,89,91,95,92,88,90,85,76,60,48,38,29,23,19,16]),
    days: ts(dayLabels,  [312,298,334,289,318,347,312,289,334,318,302,347,321,284]),
    months: ts(monthLabels, [7234,6891,7856,7123,7689,8156,7756,7423,8156,8623,7989,7756]),
  }
};

const recMail1: DNSRecord = {
  id: 'r7', rrdata: '74.125.71.26', type: 'A', resolveCount: 2341,
  periods: { hours: '09:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'allowed',
  timeSeries: {
    hours: ts(hourLabels, [12,8,6,5,7,18,45,89,112,134,128,141,138,125,131,119,98,72,56,42,31,25,18,15]),
    days: ts(dayLabels,  [2341,2234,2456,2123,2298,2512,2298,2123,2456,2341,2198,2512,2378,2089]),
    months: ts(monthLabels, [54323,51234,58456,54876,57134,60456,58234,57345,60456,63567,59134,57234]),
  }
};

const recMail2: DNSRecord = {
  id: 'r8', rrdata: '74.125.71.27', type: 'A', resolveCount: 1876,
  periods: { hours: '09:00, 1 дек.', days: '3 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'allowed',
  timeSeries: {
    hours: ts(hourLabels, [10,7,5,4,6,15,38,75,95,114,109,120,117,107,112,102,84,61,48,36,27,21,15,12]),
    days: ts(dayLabels,  [1876,1789,1967,1703,1847,2014,1845,1703,1967,1876,1768,2014,1912,1672]),
    months: ts(monthLabels, [43567,41234,46789,43456,45789,48456,46678,45789,48456,51123,47456,46234]),
  }
};

const recSmtp: DNSRecord = {
  id: 'r9', rrdata: '74.125.71.30', type: 'A', resolveCount: 456,
  periods: { hours: '08:00, 1 дек.', days: '4 дек. 2025', months: 'окт. 2025' },
  sdnsPolicy: 'Предупреждение', policyDecision: 'warning',
  timeSeries: {
    hours: ts(hourLabels, [3,2,2,2,3,6,14,28,38,45,43,47,46,42,44,40,33,24,19,14,10,8,6,4]),
    days: ts(dayLabels,  [456,434,478,412,447,489,447,412,478,456,431,489,463,405]),
    months: ts(monthLabels, [10567,9934,11245,10456,11012,11678,11234,10956,11678,12234,11456,10945]),
  }
};

const recApi1: DNSRecord = {
  id: 'r10', rrdata: '104.18.24.47', type: 'A', resolveCount: 8213,
  periods: { hours: '17:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [45,32,28,25,30,65,123,287,342,389,401,412,398,376,391,358,312,245,198,156,112,89,67,54]),
    days: ts(dayLabels,  [8213,7891,8456,7654,8123,8789,8234,7891,8456,8123,7891,8789,8234,7654]),
    months: ts(monthLabels, [189456,178234,201345,189876,202134,213456,201234,200345,213456,224567,212134,201234]),
  }
};

const recApi2: DNSRecord = {
  id: 'r11', rrdata: '104.18.25.47', type: 'A', resolveCount: 7891,
  periods: { hours: '17:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [43,31,27,24,29,62,118,275,328,373,385,396,382,361,375,343,299,235,190,150,108,86,65,52]),
    days: ts(dayLabels,  [7891,7589,8123,7345,7812,8445,7912,7589,8123,7812,7589,8445,7923,7345]),
    months: ts(monthLabels, [181234,170123,193456,182234,194323,205678,193456,192345,205678,216789,204323,193456]),
  }
};

const recApiCname: DNSRecord = {
  id: 'r12', rrdata: 'api-v2.example.com', type: 'CNAME', resolveCount: 312,
  periods: { hours: '11:00, 1 дек.', days: '2 дек. 2025', months: 'сент. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [2,1,1,1,1,3,7,16,21,25,26,27,26,24,25,23,20,16,13,10,7,6,4,3]),
    days: ts(dayLabels,  [312,297,325,289,309,334,312,289,325,309,297,334,316,278]),
    months: ts(monthLabels, [7123,6789,7456,6923,7312,7689,7456,7234,7689,8056,7623,7456]),
  }
};

const recApiV1: DNSRecord = {
  id: 'r13', rrdata: '104.18.24.47', type: 'A', resolveCount: 1234,
  periods: { hours: '15:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [8,5,4,4,5,12,24,52,67,78,81,84,80,76,78,72,62,48,38,29,21,17,13,10]),
    days: ts(dayLabels,  [1234,1189,1289,1123,1212,1312,1223,1123,1289,1212,1167,1312,1234,1089]),
    months: ts(monthLabels, [28456,26789,30234,27456,29123,31456,29234,28345,31456,32567,30123,29234]),
  }
};

const recApiV2: DNSRecord = {
  id: 'r14', rrdata: '104.18.25.47', type: 'A', resolveCount: 2567,
  periods: { hours: '16:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [15,11,9,8,10,22,48,101,131,153,159,165,157,149,155,141,123,96,77,59,43,34,26,20]),
    days: ts(dayLabels,  [2567,2456,2678,2345,2523,2745,2523,2345,2678,2567,2434,2745,2567,2234]),
    months: ts(monthLabels, [58456,54789,63234,57456,62123,68456,62234,61345,68456,72567,66123,63234]),
  }
};

const recApiHttps: DNSRecord = {
  id: 'r15', rrdata: 'api.example.com', type: 'HTTPS', resolveCount: 189,
  periods: { hours: '13:00, 1 дек.', days: '4 дек. 2025', months: 'окт. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [1,1,1,0,1,2,4,9,13,15,16,17,16,15,16,14,12,9,7,5,4,3,2,2]),
    days: ts(dayLabels,  [189,179,198,172,186,204,186,172,198,186,177,204,192,169]),
    months: ts(monthLabels, [4234,3989,4456,4123,4412,4689,4456,4245,4689,4912,4578,4456]),
  }
};

const recCdn1: DNSRecord = {
  id: 'r16', rrdata: '151.101.64.84', type: 'A', resolveCount: 12456,
  periods: { hours: '18:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [156,122,99,89,104,212,434,889,1056,1167,1201,1256,1223,1179,1198,1156,1001,789,623,489,367,289,228,181]),
    days: ts(dayLabels,  [12456,11923,13012,11456,12289,13456,12234,11456,13012,12289,11923,13456,12567,11012]),
    months: ts(monthLabels, [289456,271234,301456,283456,297123,313456,301234,298123,313456,328567,308123,301456]),
  }
};

const recCdnCname: DNSRecord = {
  id: 'r17', rrdata: 'cdn.fastly.net', type: 'CNAME', resolveCount: 678,
  periods: { hours: '16:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [9,7,5,5,6,12,24,49,58,64,66,69,67,65,66,63,55,43,34,27,20,16,13,10]),
    days: ts(dayLabels,  [678,648,709,623,669,729,668,623,709,669,648,729,683,601]),
    months: ts(monthLabels, [15678,14789,16345,15123,15878,16789,15878,15456,16789,17456,16345,15878]),
  }
};

// ── Extra records for example.com (positions 5–10) ──────────────────────────

const recE5: DNSRecord = {
  id: 'r18', rrdata: '93.184.216.35', type: 'A', resolveCount: 987,
  periods: { hours: '11:00, 1 дек.', days: '3 дек. 2025', months: 'окт. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [4,3,2,2,3,7,14,32,55,68,74,79,77,70,72,67,56,40,29,19,13,10,7,5]),
    days: ts(dayLabels,  [987,943,1034,901,969,1056,978,901,1034,987,945,1056,1001,876]),
    months: ts(monthLabels, [22345,21012,24567,22012,23678,25123,23678,22789,25123,26234,24456,23678]),
  }
};

const recE6: DNSRecord = {
  id: 'r19', rrdata: 'example.com', type: 'HTTPS', resolveCount: 234,
  periods: { hours: '13:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [1,1,0,0,1,2,5,11,15,18,19,20,19,17,18,17,14,10,8,6,4,3,2,1]),
    days: ts(dayLabels,  [234,223,245,213,228,251,229,213,245,234,221,251,237,208]),
    months: ts(monthLabels, [5234,4989,5567,5023,5412,5789,5512,5312,5789,6023,5678,5512]),
  }
};

const recE7: DNSRecord = {
  id: 'r20', rrdata: 'https://example.com/index', type: 'URI', resolveCount: 156,
  periods: { hours: '10:00, 1 дек.', days: '2 дек. 2025', months: 'сент. 2025' },
  sdnsPolicy: 'Мониторинг', policyDecision: 'allowed',
  timeSeries: {
    hours: ts(hourLabels, [1,0,0,0,1,2,4,8,11,13,14,14,14,13,13,12,10,8,6,5,3,3,2,1]),
    days: ts(dayLabels,  [156,149,163,142,152,167,153,142,163,156,148,167,158,139]),
    months: ts(monthLabels, [3456,3245,3678,3345,3567,3789,3678,3534,3789,3923,3678,3567]),
  }
};

const recE8: DNSRecord = {
  id: 'r21', rrdata: '93.184.216.36', type: 'A', resolveCount: 1102,
  periods: { hours: '14:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy: 'Блокировка', policyDecision: 'blocked',
  timeSeries: {
    hours: ts(hourLabels, [5,4,3,3,4,9,17,38,62,74,80,85,83,75,77,72,61,44,32,21,15,11,8,6]),
    days: ts(dayLabels,  [1102,1056,1156,1001,1089,1189,1089,1001,1156,1102,1045,1189,1112,978]),
    months: ts(monthLabels, [25234,23789,27456,24789,26234,27789,26234,25456,27789,29012,27012,26234]),
  }
};

const recE9: DNSRecord = {
  id: 'r22', rrdata: 'fallback.example.net', type: 'CNAME', resolveCount: 89,
  periods: { hours: '09:00, 1 дек.', days: '1 дек. 2025', months: 'окт. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [0,0,0,0,0,1,2,5,7,9,9,10,9,9,9,8,7,6,4,3,2,2,1,1]),
    days: ts(dayLabels,  [89,85,93,81,87,95,88,81,93,89,84,95,90,79]),
    months: ts(monthLabels, [1934,1823,2056,1878,2012,2134,2056,1978,2134,2245,2078,2012]),
  }
};

const recE10: DNSRecord = {
  id: 'r23', rrdata: '2606:2800:220:1:248:1893:25c8:1947', type: 'AAAA', resolveCount: 445,
  periods: { hours: '15:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy: 'Нет', policyDecision: 'nodata',
  timeSeries: {
    hours: ts(hourLabels, [2,2,1,1,2,4,9,19,32,40,43,46,45,41,42,39,33,23,17,11,7,6,4,3]),
    days: ts(dayLabels,  [445,425,467,405,438,478,439,405,467,445,423,478,452,398]),
    months: ts(monthLabels, [10234,9678,11012,10023,10678,11234,10678,10234,11234,11789,11023,10678]),
  }
};

export const mockDomains: DomainNode[] = [
  {
    id: 'example.com',
    fqdn: 'example.com',
    records: [rec1, rec2, rec3, rec4, recE5, recE6, recE7, recE8, recE9, recE10],
    subdomains: [
      {
        id: 'www.example.com',
        fqdn: 'www.example.com',
        records: [recWwwA, recWwwCname],
        subdomains: [],
      },
      {
        id: 'mail.example.com',
        fqdn: 'mail.example.com',
        records: [recMail1, recMail2],
        subdomains: [
          {
            id: 'smtp.mail.example.com',
            fqdn: 'smtp.mail.example.com',
            records: [recSmtp],
            subdomains: [],
          }
        ],
      },
      {
        id: 'api.example.com',
        fqdn: 'api.example.com',
        records: [recApi1, recApi2, recApiCname, recApiHttps],
        subdomains: [
          {
            id: 'v1.api.example.com',
            fqdn: 'v1.api.example.com',
            records: [recApiV1],
            subdomains: [],
          },
          {
            id: 'v2.api.example.com',
            fqdn: 'v2.api.example.com',
            records: [recApiV2],
            subdomains: [],
          },
        ],
      },
      {
        id: 'cdn.example.com',
        fqdn: 'cdn.example.com',
        records: [recCdn1, recCdnCname],
        subdomains: [],
      },
    ],
  },
];

// ── Helpers for IP mock data ─────────────────────────────────────────────────

const ipTs = (labels: string[], base: number, spread = 0.25) =>
  labels.map((time, i) => ({
    time,
    count: Math.max(1, Math.round(base * (1 + (Math.sin(i * 0.7) * spread)))),
  }));

// ── IPv4 nodes (IP → [FQDNs]) ────────────────────────────────────────────────

const mkA = (
  id: string,
  fqdn: string,
  resolveCount: number,
  sdnsPolicy: string,
  policyDecision: import('./types').PolicyDecision,
  base: { h: number; d: number; m: number },
): import('./types').DNSRecord => ({
  id,
  rrdata: fqdn,
  type: 'A',
  resolveCount,
  periods: { hours: '15:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy,
  policyDecision,
  timeSeries: {
    hours: ipTs(hourLabels, base.h),
    days:  ipTs(dayLabels,  base.d),
    months: ipTs(monthLabels, base.m),
  },
});

const mkAAAA = (
  id: string,
  fqdn: string,
  resolveCount: number,
  sdnsPolicy: string,
  policyDecision: import('./types').PolicyDecision,
  base: { h: number; d: number; m: number },
): import('./types').DNSRecord => ({
  id,
  rrdata: fqdn,
  type: 'AAAA',
  resolveCount,
  periods: { hours: '14:00, 1 дек.', days: '4 дек. 2025', months: 'нояб. 2025' },
  sdnsPolicy,
  policyDecision,
  timeSeries: {
    hours: ipTs(hourLabels, base.h),
    days:  ipTs(dayLabels,  base.d),
    months: ipTs(monthLabels, base.m),
  },
});

export const mockIPv4Nodes: DomainNode[] = [
  {
    id: '93.184.216.34',
    fqdn: '93.184.216.34',
    subdomains: [],
    records: [
      mkA('ip4_1a', 'example.com',     1247, 'Нет', 'nodata',  { h: 72, d: 1247, m: 29000 }),
      mkA('ip4_1b', 'www.example.com', 5892, 'Нет', 'nodata',  { h: 310, d: 5892, m: 131000 }),
    ],
  },
];

// ── IPv6 nodes (IP → [FQDNs]) ────────────────────────────────────────────────

export const mockIPv6Nodes: DomainNode[] = [
  {
    id: "2606:2800:220:1:248:1893:25c8:1946",
    fqdn: "2606:2800:220:1:248:1893:25c8:1946",
    subdomains: [],
    records: [
      mkAAAA("ip6_1a", "example.com",     843, "Нет", "nodata", { h: 50, d: 843, m: 19000 }),
      mkAAAA("ip6_1b", "www.example.com", 312, "Нет", "nodata", { h: 20, d: 312, m: 7200 }),
    ],
  },
];
