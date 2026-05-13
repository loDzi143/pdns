import React, { useState, useCallback, useRef, useEffect, createContext, useContext, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import {
  ChevronRight, ChevronDown, LayoutList, BarChart2,
  Globe, Server, ShieldCheck,
  Check, Minus, Filter, Clock, Calendar,
  CalendarDays, Info, Database, TrendingUp,
} from 'lucide-react';
import { DNSRecord, DomainNode, RecordType, PeriodType, ViewMode, PolicyDecision, InputMode } from './types';
import { mockDomains, mockIPv4Nodes, mockIPv6Nodes } from './mockData';

// ─── Theme ─────────────────────────────────────────────────────────────────────

interface ThemeColors {
  isDark: boolean;
  widgetBg: string; headerBg: string; filterBg: string;
  tableHeaderBg: string; secondaryBg: string; tertiaryBg: string;
  dropdownBg: string; groupRowBg: string;
  bd1: string; bd2: string;
  tx1: string; tx2: string; tx3: string; tx4: string; tx5: string;
  hov: string; sel: string; inp: string;
  grd: string; cht: string; cbBorder: string;
}

function buildTheme(isDark: boolean): ThemeColors {
  return isDark ? {
    isDark: true,
    widgetBg: '#161B22',  headerBg: 'rgba(13,17,23,0.75)',
    filterBg: 'rgba(13,17,23,0.5)',  tableHeaderBg: '#0D1117',
    secondaryBg: '#21262D',  tertiaryBg: '#1C2128',
    dropdownBg: '#161B22',  groupRowBg: 'rgba(13,17,23,0.4)',
    bd1: '#21262D',  bd2: '#30363D',
    tx1: '#E6EDF3',  tx2: '#C9D1D9',  tx3: '#8B949E',  tx4: '#6E7681',  tx5: '#4D5566',
    hov: 'rgba(28,33,40,0.65)',  sel: 'rgba(10,69,245,0.06)',
    inp: '#21262D',  grd: '#21262D',  cht: '#0D1117',  cbBorder: '#484F58',
  } : {
    isDark: false,
    widgetBg: '#FFFFFF',  headerBg: 'rgba(246,248,250,0.95)',
    filterBg: 'rgba(246,248,250,0.85)',  tableHeaderBg: '#F6F8FA',
    secondaryBg: '#F6F8FA',  tertiaryBg: '#EAEEF2',
    dropdownBg: '#FFFFFF',  groupRowBg: 'rgba(246,248,250,0.9)',
    bd1: '#D0D7DE',  bd2: '#BFC6CD',
    tx1: '#1F2328',  tx2: '#24292F',  tx3: '#57606A',  tx4: '#6E7781',  tx5: '#8C959F',
    hov: 'rgba(208,215,222,0.3)',  sel: 'rgba(10,69,245,0.04)',
    inp: '#F6F8FA',  grd: '#EAEEF2',  cht: '#FFFFFF',  cbBorder: '#8C959F',
  };
}

const ThemeCtx = createContext<ThemeColors>(buildTheme(true));
const useT = () => useContext(ThemeCtx);

// ─── Input Mode Context ─────────────────────────────────────────────────────────

const ModeCtx = createContext<InputMode>('fqdn');
const useMode = () => useContext(ModeCtx);

// ─── Constants ─────────────────────────────────────────────────────────────────

const ALL_RECORD_TYPES: RecordType[] = ['A', 'AAAA', 'CNAME', 'HTTPS', 'NS', 'URI'];
const IP_ENABLED_TYPES: RecordType[] = ['A', 'AAAA'];
const MAX_CHART_SELECTIONS = 20;

const RECORD_TYPE_STYLES: Record<RecordType, { bg: string; text: string; border: string }> = {
  A:     { bg: 'bg-blue-500/10',    text: 'text-blue-500',    border: 'border-blue-500/30' },
  AAAA:  { bg: 'bg-violet-500/10',  text: 'text-violet-500',  border: 'border-violet-500/30' },
  CNAME: { bg: 'bg-cyan-500/10',    text: 'text-cyan-500',    border: 'border-cyan-500/30' },
  HTTPS: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
  NS:    { bg: 'bg-amber-500/10',   text: 'text-amber-500',   border: 'border-amber-500/30' },
  URI:   { bg: 'bg-rose-500/10',    text: 'text-rose-500',    border: 'border-rose-500/30' },
};

const DECISION_CONFIG: Record<PolicyDecision, { label: string; bg: string; text: string; dotColor: string }> = {
  allowed: { label: 'Разрешено',      bg: 'bg-emerald-500/10', text: 'text-emerald-500', dotColor: '#10B981' },
  blocked: { label: 'Заблокировано',  bg: 'bg-red-500/10',     text: 'text-red-500',     dotColor: '#EF4444' },
  warning: { label: 'Предупреждение', bg: 'bg-amber-500/10',   text: 'text-amber-500',   dotColor: '#F59E0B' },
  nodata:  { label: '—',              bg: '',                   text: '',                 dotColor: '' },
};

const CHART_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#D946EF', // fuchsia
  '#EAB308', // yellow
  '#0EA5E9', // sky
  '#A855F7', // purple
  '#22C55E', // green
  '#FB923C', // orange-400
  '#F472B6', // pink-400
  '#34D399', // emerald-400
  '#A78BFA', // violet-400
];

const PERIOD_LABELS: Record<PeriodType, string> = {
  hours:  'Время (местное)',
  days:   'Дата события',
  months: 'Месяц',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Russian pluralization */
function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10, m100 = n % 100;
  if (m100 >= 11 && m100 <= 14) return `${n} ${many}`;
  if (m10 === 1) return `${n} ${one}`;
  if (m10 >= 2 && m10 <= 4) return `${n} ${few}`;
  return `${n} ${many}`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace('.0', '') + 'K';
  return n.toString();
}

/** Равномерно выбирает n точек из массива (первую, последнюю и промежуточные) */
function pickPoints<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr;
  return Array.from({ length: n }, (_, i) =>
    arr[Math.round(i * (arr.length - 1) / (n - 1))]
  );
}

const BREAKDOWN_COUNT = 5;
const RECORDS_PAGE_SIZE = 5;

// ─── Tree Lines ─────────────────────────────────────────────────────────────────

type TreeSeg = 'pipe' | 'branch' | 'last' | 'blank';
const TREE_W = 20; // px per indent segment

/** Converts leaf connectors to ancestor continuation indicators */
const propagateSegs = (segs: TreeSeg[]): TreeSeg[] =>
  segs.map(s => s === 'branch' ? 'pipe' : s === 'last' ? 'blank' : s);

const TreeLines: React.FC<{ segs: TreeSeg[] }> = ({ segs }) => {
  const T = useT();
  if (segs.length === 0) return null;
  const lc = T.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)';
  return (
    <div className="flex-shrink-0 self-stretch flex" style={{ width: segs.length * TREE_W }}>
      {segs.map((seg, i) => (
        <div key={i} className="relative self-stretch flex-shrink-0" style={{ width: TREE_W }}>
          {/* Full-height vertical pipe */}
          {(seg === 'pipe' || seg === 'branch') && (
            <div className="absolute" style={{ left: TREE_W / 2 - 0.5, top: 0, bottom: 0, width: 1, background: lc }} />
          )}
          {/* Half-height vertical pipe (stops at connector) */}
          {seg === 'last' && (
            <div className="absolute" style={{ left: TREE_W / 2 - 0.5, top: 0, height: '50%', width: 1, background: lc }} />
          )}
          {/* Horizontal connector */}
          {(seg === 'branch' || seg === 'last') && (
            <div className="absolute" style={{ left: TREE_W / 2 - 0.5, right: 0, top: 'calc(50% - 0.5px)', height: 1, background: lc }} />
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Tooltip ────────────────────────────────────────────────────────────────

interface TipProps { text: string; children: React.ReactNode }
const Tip: React.FC<TipProps> = ({ text, children }) => {
  const T = useT();
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && text && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-md text-xs shadow-xl pointer-events-none max-w-[240px] text-center"
          style={{ background: T.cht, border: `1px solid ${T.bd2}`, color: T.tx2 }}
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: T.bd2, marginTop: '-1px' }} />
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: T.cht }} />
        </div>
      )}
    </div>
  );
};

/**
 * Tooltip специально для чекбокса «На график».
 * Выравнивает правый край тултипа по левому краю кнопки.
 * Для длинного текста ограничивает ширину (2–3 строки).
 */
const ChartTip: React.FC<{ text: string; long?: boolean; children: React.ReactNode }> = ({ text, long, children }) => {
  const T = useT();
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && text && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{ bottom: 'calc(100% + 7px)', right: '100%' }}
        >
          <div
            className="px-2.5 py-1.5 rounded-md text-xs shadow-xl"
            style={{
              background: T.cht,
              border: `1px solid ${T.bd2}`,
              color: T.tx2,
              whiteSpace: long ? 'normal' : 'nowrap',
              maxWidth: long ? '176px' : undefined,
              lineHeight: 1.4,
            }}
          >
            {text}
          </div>
          {/* Arrow pointing down at bottom-right of tooltip */}
          <div style={{
            position: 'absolute', top: '100%', right: '5px', marginTop: '-1px',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: `5px solid ${T.bd2}`,
          }} />
          <div style={{
            position: 'absolute', top: '100%', right: '6px',
            width: 0, height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: `4px solid ${T.cht}`,
          }} />
        </div>
      )}
    </div>
  );
};

// ─── Filter Panel ──────────────────────────────────────────────────────────────

interface FilterPanelProps {
  recordTypes: RecordType[];
  setRecordTypes: (v: RecordType[]) => void;
  period: PeriodType;
  setPeriod: (v: PeriodType) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  selectedCount: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  recordTypes, setRecordTypes, period, setPeriod, viewMode, setViewMode, selectedCount
}) => {
  const T = useT();
  const mode = useMode();
  const isIPMode = mode !== 'fqdn';
  const [typeOpen, setTypeOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setTypeOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleType = (t: RecordType, disabled: boolean) => {
    if (disabled) return;
    setRecordTypes(
      recordTypes.includes(t)
        ? recordTypes.length > 1 ? recordTypes.filter(x => x !== t) : recordTypes
        : [...recordTypes, t]
    );
  };

  const allSelected = recordTypes.length === ALL_RECORD_TYPES.length;

  const typeLabel = allSelected
    ? 'Все типы'
    : recordTypes.length === 1
    ? recordTypes[0]
    : plural(recordTypes.length, 'тип', 'типа', 'типов');

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b flex-wrap"
      style={{ background: T.filterBg, borderColor: T.bd1 }}
    >
      {/* Record type filter */}
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setTypeOpen(v => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs transition-all"
          style={{ background: T.inp, borderColor: T.bd2, color: T.tx2 }}
        >
          <Filter size={12} style={{ color: T.tx4 }} />
          <span style={{ color: T.tx3 }}>Тип записи:</span>
          <span style={{ color: T.tx1 }} className="font-medium">{typeLabel}</span>
          <ChevronDown size={12} className={`transition-transform ${typeOpen ? 'rotate-180' : ''}`} style={{ color: T.tx4 }} />
        </button>

        {typeOpen && (
          <div
            className="absolute top-full left-0 mt-1 z-50 rounded-lg shadow-2xl overflow-hidden min-w-[160px] border"
            style={{ background: T.dropdownBg, borderColor: T.bd2 }}
          >
            {/* "All types" option — hidden in IP mode */}
            {!isIPMode && (
              <div
                className="flex items-center gap-2.5 px-3 py-2 cursor-pointer border-b"
                style={{ borderColor: T.bd1 }}
                onMouseEnter={e => (e.currentTarget.style.background = T.secondaryBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => setRecordTypes(allSelected ? [recordTypes[0]] : [...ALL_RECORD_TYPES])}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border ${allSelected ? 'bg-[#0A45F5] border-[#0A45F5]' : ''}`} style={!allSelected ? { borderColor: T.cbBorder } : {}}>
                  {allSelected && <Check size={10} className="text-white" />}
                  {!allSelected && recordTypes.length > 0 && <Minus size={10} style={{ color: T.tx4 }} />}
                </div>
                <span className="text-xs" style={{ color: T.tx2 }}>Все типы</span>
              </div>
            )}
            {ALL_RECORD_TYPES.map(t => {
              const checked = recordTypes.includes(t);
              const styles = RECORD_TYPE_STYLES[t];
              const disabled = isIPMode && !IP_ENABLED_TYPES.includes(t);
              return (
                <div
                  key={t}
                  className="flex items-center gap-2.5 px-3 py-2"
                  style={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.38 : 1,
                  }}
                  onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = T.secondaryBg; }}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => toggleType(t, disabled)}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border ${checked && !disabled ? 'bg-[#0A45F5] border-[#0A45F5]' : ''}`}
                    style={!checked || disabled ? { borderColor: T.cbBorder } : {}}
                  >
                    {checked && !disabled && <Check size={10} className="text-white" />}
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${styles.bg} ${styles.text} ${styles.border} font-mono`}>{t}</span>
                  {disabled && (
                    <span className="text-[9px] ml-auto" style={{ color: T.tx5 }}>N/A</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-1 p-0.5 rounded-md border" style={{ background: T.inp, borderColor: T.bd2 }}>
        {(['hours', 'days', 'months'] as PeriodType[]).map(p => {
          const Icon = p === 'hours' ? Clock : p === 'days' ? CalendarDays : Calendar;
          const lbl = p === 'hours' ? 'По часам' : p === 'days' ? 'По дням' : 'По месяцам';
          const active = period === p;
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all"
              style={{
                background: active ? '#0A45F5' : 'transparent',
                color: active ? '#FFFFFF' : T.tx4,
              }}
            >
              <Icon size={11} />
              {lbl}
            </button>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-0.5 rounded-md border" style={{ background: T.inp, borderColor: T.bd2 }}>
          {(['table', 'chart'] as ViewMode[]).map(m => {
            const Icon = m === 'table' ? LayoutList : BarChart2;
            const lbl = m === 'table' ? 'Таблица' : 'График';
            const active = viewMode === m;
            return (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all border"
                style={{
                  background: active ? T.widgetBg : 'transparent',
                  color: active ? T.tx1 : T.tx4,
                  borderColor: active ? T.bd1 : 'transparent',
                  boxShadow: active ? `0 1px 2px rgba(0,0,0,${T.isDark ? 0.3 : 0.08})` : 'none',
                }}
              >
                <Icon size={12} />
                {lbl}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Table Header ──────────────────────────────────────────────────────────────

const TableHeader: React.FC<{ period: PeriodType }> = ({ period }) => {
  const T = useT();
  const mode = useMode();
  const firstColLabel = mode === 'fqdn' ? 'FQDN' : 'IP';
  return (
    <div
      className="grid border-b sticky top-0 z-10"
      style={{ gridTemplateColumns: 'minmax(240px,1fr) 96px 72px 138px 130px 116px', background: T.tableHeaderBg, borderColor: T.bd1 }}
    >
      {[
        { label: firstColLabel,   align: 'text-left',   pl: 'pl-10' },
        { label: 'Резолвов',      align: 'text-right',  pl: '' },
        { label: 'Тип',           align: 'text-center', pl: '' },
        { label: 'Политика SDNS', align: 'text-left',   pl: '' },
        { label: 'Решение',       align: 'text-left',   pl: '' },
        { label: 'На график',     align: 'text-center', pl: '' },
      ].map((col, i) => (
        <div
          key={i}
          className={`px-3 py-2 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap ${col.align} ${col.pl}`}
          style={{ color: T.tx5 }}
        >
          {col.label}
        </div>
      ))}
    </div>
  );
};

// ─── Record Row ────────────────────────────────────────────────────────────────

interface RecordRowProps {
  record: DNSRecord;
  domain: string;
  segs: TreeSeg[];
  selectedIds: Set<string>;
  onSelect: (record: DNSRecord, domain: string) => void;
  maxReached: boolean;
  period: PeriodType;
}

// ─── Time-Point Sub-row ────────────────────────────────────────────────────────

interface TimePointRowProps { time: string; count: number; segs: TreeSeg[]; }

const SourceRow: React.FC<{ source: string; count: number; segs: TreeSeg[] }> = ({ source, count, segs }) => {
  const T = useT();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="grid items-center border-b transition-colors"
      style={{
        gridTemplateColumns: 'minmax(240px,1fr) 96px 72px 138px 130px 116px',
        background: hovered ? T.hov : 'transparent',
        borderColor: T.bd1 + '25',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-stretch min-w-0" style={{ alignSelf: 'stretch', paddingLeft: '12px' }}>
        <TreeLines segs={segs} />
        <div className="py-1.5 px-1 text-xs" style={{ color: T.tx2 }}>{source}</div>
      </div>

      <div className="px-3 py-1.5 text-right">
        <span className="text-xs tabular-nums" style={{ color: T.tx3 }}>
          {count.toLocaleString('ru-RU')}
        </span>
      </div>

      <div /><div /><div /><div />
    </div>
  );
};

const TimePointRow: React.FC<TimePointRowProps> = ({ time, count, segs }) => {
  const T = useT();
  const [hovered, setHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const srcPropSegs = propagateSegs(segs);

  const getSourceBreakdown = (t: string, total: number) => {
    // Deterministic: some time points have only pDNS, others split between pDNS and OctoResolver
    const seed = t.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const hasBoth = seed % 3 !== 0 && total > 1;
    if (!hasBoth) {
      return [{ source: 'pDNS', count: total }];
    }
    const p = Math.max(1, Math.floor(total * (0.55 + ((seed % 5) - 2) * 0.05)));
    const o = total - p;
    return [
      { source: 'pDNS', count: p },
      { source: 'OctoResolver', count: Math.max(1, o) }
    ];
  };

  const sources = getSourceBreakdown(time, count);

  return (
    <>
      <div
        className="grid items-center border-b transition-colors"
        style={{
          gridTemplateColumns: 'minmax(240px,1fr) 96px 72px 138px 130px 116px',
          background: hovered ? T.hov : 'transparent',
          borderColor: T.bd1 + '35',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Время + chevron */}
        <div className="flex items-stretch min-w-0" style={{ alignSelf: 'stretch', paddingLeft: '12px' }}>
          <TreeLines segs={segs} />
          <div className="flex items-center py-1.5 flex-1 min-w-0">
            <button
              className="w-5 h-5 flex items-center justify-center flex-shrink-0 mr-1 rounded transition-colors hover:opacity-70"
              style={{ color: T.tx4 }}
              onClick={e => { e.stopPropagation(); setIsOpen(v => !v); }}
            >
              {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </button>
            <span className="text-xs" style={{ color: T.tx2 }}>{time}</span>
          </div>
        </div>

        {/* Резолвов */}
        <div className="px-3 py-1.5 text-right">
          <span className="text-xs tabular-nums" style={{ color: T.tx3 }}>
            {count.toLocaleString('ru-RU')}
          </span>
        </div>

        <div /><div /><div /><div />
      </div>

      {/* Expanded source rows */}
      {isOpen && sources.map((s, idx) => (
        <SourceRow
          key={idx}
          source={s.source}
          count={s.count}
          segs={[...srcPropSegs, idx === sources.length - 1 ? 'last' : 'branch']}
        />
      ))}
    </>
  );
};

// ─── Record Row ────────────────────────────────────────────────────────────────

const RecordRow: React.FC<RecordRowProps> = ({ record, domain, segs, selectedIds, onSelect, maxReached, period }) => {
  const T = useT();
  const mode = useMode();
  const isIPMode = mode !== 'fqdn';
  const isSelected = selectedIds.has(record.id);
  const isDisabled = maxReached && !isSelected;
  const styles = RECORD_TYPE_STYLES[record.type];
  const decision = DECISION_CONFIG[record.policyDecision];

  const [hovered, setHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const rowBg = isSelected ? T.sel : hovered ? T.hov : 'transparent';
  const timePoints = pickPoints(record.timeSeries[period], BREAKDOWN_COUNT);
  const aggregatedCount = timePoints.reduce((sum, p) => sum + p.count, 0);
  const tpPropSegs = propagateSegs(segs);
  // IP mode: records are FQDNs → use Globe icon; FQDN mode: records are IPs/values → use Server
  const RowIcon = isIPMode ? Globe : Server;

  return (
    <>
      {/* ── Collapsed / header row ── */}
      <div
        className="grid items-center border-b transition-colors"
        style={{
          gridTemplateColumns: 'minmax(240px,1fr) 96px 72px 138px 130px 116px',
          background: rowBg,
          borderColor: T.bd1 + '60',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* FQDN / RRDATA */}
        <div className="flex items-stretch min-w-0" style={{ alignSelf: 'stretch', paddingLeft: '12px' }}>
          <TreeLines segs={segs} />
          <div className="flex items-center py-2 flex-1 min-w-0">
            <button
              className="w-5 h-5 flex items-center justify-center flex-shrink-0 mr-1 rounded transition-colors hover:opacity-70"
              style={{ color: T.tx4 }}
              onClick={e => { e.stopPropagation(); setIsOpen(v => !v); }}
            >
              {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </button>
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mr-1">
              <RowIcon size={12} style={{ color: T.tx5 }} />
            </div>
            <span className="font-mono text-xs truncate" style={{ color: T.tx2 }} title={record.rrdata}>
              {record.rrdata}
            </span>
            <span
              className="ml-2 flex-shrink-0 inline-flex items-center justify-center text-[10px] rounded-full px-1.5 h-[16px] min-w-[16px]"
              style={{
                background: isOpen ? 'rgba(10,69,245,0.12)' : T.secondaryBg,
                color: isOpen ? '#6B9EFF' : T.tx4,
                border: `1px solid ${isOpen ? 'rgba(10,69,245,0.25)' : T.bd1}`,
              }}
            >
              {BREAKDOWN_COUNT}
            </span>
          </div>
        </div>

        {/* Резолвов */}
        <div className="px-3 py-2 text-right">
          <span className="text-xs font-medium tabular-nums" style={{ color: T.tx1 }}>
            {aggregatedCount.toLocaleString('ru-RU')}
          </span>
        </div>

        {/* Тип */}
        <div className="px-2 py-2 flex items-center justify-center">
          <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border ${styles.bg} ${styles.text} ${styles.border}`}>
            {record.type}
          </span>
        </div>

        {/* SDNS Policy */}
        <div className="px-3 py-2">
          <span className="text-xs" style={{ color: T.tx3 }}>{record.sdnsPolicy}</span>
        </div>

        {/* Policy Decision */}
        <div className="px-3 py-2">
          {record.policyDecision === 'nodata' ? (
            <span className="text-xs" style={{ color: T.tx5 }}>—</span>
          ) : (
            <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full border ${decision.bg} ${decision.text}`} style={{ borderColor: 'currentColor', opacity: 0.9 }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: decision.dotColor }} />
              {decision.label}
            </span>
          )}
        </div>

        {/* Chart checkbox */}
        <div className="px-3 py-2 flex items-center justify-center">
          <ChartTip
            text={
              isSelected
                ? 'Убрать запись из графика'
                : isDisabled
                ? `Можно выбрать только ${MAX_CHART_SELECTIONS} записей для отображения на графике`
                : 'Добавить запись в график'
            }
            long={isDisabled && !isSelected}
          >
            <button
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelect(record, domain)}
              className="flex items-center gap-1.5 transition-all"
              style={{ opacity: isDisabled ? 0.3 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-all"
                style={{
                  background: isSelected ? '#0A45F5' : 'transparent',
                  borderColor: isSelected ? '#0A45F5' : T.cbBorder,
                }}
              >
                {isSelected && <Check size={10} className="text-white" />}
              </div>
            </button>
          </ChartTip>
        </div>
      </div>

      {/* ── Expanded time-point sub-rows ── */}
      {isOpen && timePoints.map((point, i) => (
        <TimePointRow
          key={i}
          time={point.time}
          count={point.count}
          segs={[...tpPropSegs, i === timePoints.length - 1 ? 'last' : 'branch']}
        />
      ))}
    </>
  );
};

// ─── Group Row ─────────────────────────────────────────────────────────────────

interface GroupRowProps {
  label: string;
  count: number;
  segs: TreeSeg[];
  isExpanded: boolean;
  onToggle: () => void;
  isRecords?: boolean;
}

const GroupRow: React.FC<GroupRowProps> = ({ label, count, segs, isExpanded, onToggle, isRecords }) => {
  const T = useT();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex items-stretch cursor-pointer border-b select-none transition-colors"
      style={{
        paddingLeft: '12px',
        paddingRight: '12px',
        background: hovered ? T.hov : T.groupRowBg,
        borderColor: T.bd1 + '50',
      }}
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <TreeLines segs={segs} />
      <div className="flex items-center gap-2 py-1.5 flex-1 min-w-0">
        {isExpanded
          ? <ChevronDown size={11} style={{ color: T.tx5 }} className="flex-shrink-0" />
          : <ChevronRight size={11} style={{ color: T.tx5 }} className="flex-shrink-0" />}
        {isRecords
          ? <Database size={11} style={{ color: T.tx5 }} className="flex-shrink-0" />
          : <Globe size={11} style={{ color: T.tx5 }} className="flex-shrink-0" />}
        <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: T.tx5 }}>{label}</span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
          style={{ background: T.secondaryBg, color: T.tx4 }}
        >{count}</span>
      </div>
    </div>
  );
};

// ─── Loading Row ───────────────────────────────────────────────────────────────

const LoadingRow: React.FC<{ segs: TreeSeg[] }> = ({ segs }) => {
  const T = useT();
  return (
    <div className="flex items-stretch border-b" style={{ paddingLeft: '12px', borderColor: T.bd1 + '50' }}>
      <TreeLines segs={segs} />
      <div className="flex items-center gap-3 py-3">
        <div className="w-3 h-3 rounded-full border-2 border-[#0A45F5] border-t-transparent animate-spin" />
        <div className="h-2 rounded animate-pulse w-48" style={{ background: T.secondaryBg }} />
      </div>
    </div>
  );
};

// ─── Domain Section (recursive) ────────────────────────────────────────────────

interface DomainSectionProps {
  node: DomainNode;
  segs: TreeSeg[];
  expandedSet: Set<string>;
  loadedSet: Set<string>;
  loadingSet: Set<string>;
  onToggle: (id: string) => void;
  selectedIds: Set<string>;
  onSelectRecord: (r: DNSRecord, domain: string) => void;
  maxReached: boolean;
  period: PeriodType;
  typeFilter: RecordType[];
}

const DomainSection: React.FC<DomainSectionProps> = ({
  node, segs, expandedSet, loadedSet, loadingSet,
  onToggle, selectedIds, onSelectRecord, maxReached, period, typeFilter
}) => {
  const T = useT();
  const mode = useMode();
  const isIPMode = mode !== 'fqdn';
  const [hovered, setHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(RECORDS_PAGE_SIZE);

  const isExpanded    = expandedSet.has(node.id);
  const isRecordsOpen = expandedSet.has(`${node.id}-records`);
  const isSubsOpen    = expandedSet.has(`${node.id}-subs`);
  const isLoaded      = loadedSet.has(node.id);
  const isLoading     = loadingSet.has(node.id);

  const filteredRecords = node.records.filter(r => typeFilter.includes(r.type));
  const visibleRecords  = filteredRecords.slice(0, visibleCount);
  const hiddenCount     = filteredRecords.length - visibleRecords.length;

  const isRoot = segs.length === 0;
  const rowBg  = isRoot
    ? (hovered ? T.tertiaryBg : T.secondaryBg)
    : (hovered ? T.hov : 'transparent');

  // IP mode: root rows are IPs → Server icon; FQDN mode: root rows are domains → Globe
  const RootIcon = isIPMode ? Server : Globe;
  // In IP mode: records are FQDNs → Globe in group; FQDN mode: records are resource records → Database
  const recordGroupIsRecords = !isIPMode;
  const recordGroupLabel = isIPMode ? 'FQDN' : 'Записи';
  const recordBadge = isIPMode
    ? plural(node.records.length, 'домен', 'домена', 'доменов')
    : plural(node.records.length, 'запись', 'записи', 'записей');

  // ── child segs ──
  const childPropSegs    = propagateSegs(segs);
  const hasRecords       = filteredRecords.length > 0;
  // In IP mode, no subdomains group ever
  const hasSubs          = !isIPMode && node.subdomains.length > 0;
  const recordsGroupSegs = [...childPropSegs, hasRecords && hasSubs ? 'branch' : 'last'] as TreeSeg[];
  const subsGroupSegs    = [...childPropSegs, 'last'] as TreeSeg[];
  const recChildPropSegs = propagateSegs(recordsGroupSegs);
  const subChildPropSegs = propagateSegs(subsGroupSegs);

  return (
    <>
      {/* Domain / IP row */}
      <div
        className="flex items-stretch cursor-pointer border-b select-none transition-colors"
        style={{ paddingLeft: '12px', paddingRight: '12px', background: rowBg, borderColor: T.bd1 }}
        onClick={() => onToggle(node.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <TreeLines segs={segs} />
        <div className="flex items-center gap-2 py-2.5 flex-1 min-w-0">
          <span className="w-4 flex-shrink-0" style={{ color: T.tx3 }}>
            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
          <RootIcon size={13} style={{ color: isRoot ? '#0A45F5' : T.tx4 }} className="flex-shrink-0" />
          <span
            className="font-mono text-xs flex-shrink-0"
            style={{ color: isRoot ? T.tx1 : T.tx2, fontWeight: isRoot ? 500 : 400 }}
          >
            {node.fqdn}
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            {node.records.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: T.secondaryBg, color: T.tx4 }}>
                {recordBadge}
              </span>
            )}
            {!isIPMode && node.subdomains.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: T.secondaryBg, color: T.tx4 }}>
                {plural(node.subdomains.length, 'поддомен', 'поддомена', 'поддоменов')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <>
          {isLoading && !isLoaded ? (
            <LoadingRow segs={[...childPropSegs, 'last']} />
          ) : isLoaded ? (
            <>
              {/* Records / FQDN group */}
              {hasRecords && (
                <>
                  <GroupRow
                    label={recordGroupLabel}
                    count={node.records.length}
                    segs={recordsGroupSegs}
                    isExpanded={isRecordsOpen}
                    onToggle={() => onToggle(`${node.id}-records`)}
                    isRecords={recordGroupIsRecords}
                  />
                  {isRecordsOpen && (
                    <>
                      {visibleRecords.map((rec, ri) => {
                        const isLastRec = ri === visibleRecords.length - 1 && hiddenCount === 0;
                        return (
                          <RecordRow
                            key={rec.id}
                            record={rec}
                            domain={node.fqdn}
                            segs={[...recChildPropSegs, isLastRec ? 'last' : 'branch']}
                            selectedIds={selectedIds}
                            onSelect={onSelectRecord}
                            maxReached={maxReached}
                            period={period}
                          />
                        );
                      })}
                      {hiddenCount > 0 && (
                        <div
                          className="flex items-stretch border-b"
                          style={{ paddingLeft: '12px', borderColor: T.bd1 + '50' }}
                        >
                          <TreeLines segs={[...recChildPropSegs, 'last']} />
                          <div className="flex items-center py-1.5">
                            <button
                              onClick={() => setVisibleCount(v => v + RECORDS_PAGE_SIZE)}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs transition-all hover:opacity-80"
                              style={{
                                background: 'rgba(10,69,245,0.07)',
                                borderColor: 'rgba(10,69,245,0.22)',
                                color: '#6B9EFF',
                              }}
                            >
                              Показать ещё {Math.min(hiddenCount, RECORDS_PAGE_SIZE)} из {hiddenCount}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Subdomains group — FQDN mode only */}
              {hasSubs && (
                <>
                  <GroupRow
                    label="Поддомены"
                    count={node.subdomains.length}
                    segs={subsGroupSegs}
                    isExpanded={isSubsOpen}
                    onToggle={() => onToggle(`${node.id}-subs`)}
                  />
                  {isSubsOpen && node.subdomains.map((sub, si) => (
                    <DomainSection
                      key={sub.id}
                      node={sub}
                      segs={[...subChildPropSegs, si === node.subdomains.length - 1 ? 'last' : 'branch']}
                      expandedSet={expandedSet}
                      loadedSet={loadedSet}
                      loadingSet={loadingSet}
                      onToggle={onToggle}
                      selectedIds={selectedIds}
                      onSelectRecord={onSelectRecord}
                      maxReached={maxReached}
                      period={period}
                      typeFilter={typeFilter}
                    />
                  ))}
                </>
              )}
            </>
          ) : null}
        </>
      )}
    </>
  );
};

// ─── Chart View ────────────────────────────────────────────────────────────────

interface SelectedEntry { record: DNSRecord; domain: string; }

interface ChartViewProps {
  selectedEntries: SelectedEntry[];
  period: PeriodType;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label, selectedEntries }) => {
  const T = useT();
  const mode = useMode();
  const isIPMode = mode !== 'fqdn';
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg shadow-2xl border" style={{ background: T.cht, borderColor: T.bd2, maxWidth: '400px' }}>
      <div className="px-3 pt-2.5 pb-2 border-b" style={{ borderColor: T.bd1 + '80' }}>
        <p className="text-xs font-medium" style={{ color: T.tx4 }}>{label}</p>
      </div>
      <div className="px-3 py-1.5">
        {payload.map((entry: any, i: number) => {
          const idx = parseInt((entry.dataKey ?? '').replace('rec_', '') || '0', 10);
          const se: SelectedEntry | undefined = selectedEntries?.[idx];
          const left  = se ? (isIPMode ? se.record.rrdata : se.domain) : '';
          const right = se ? (isIPMode ? se.domain : se.record.rrdata) : '';
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <div style={{ height: '1px', background: T.bd2, opacity: 0.35, margin: '4px 0' }} />
              )}
              <div className="flex items-center gap-2 py-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                  <span className="text-xs break-all" style={{ color: T.tx2 }}>
                    {se ? `${left} → ${right}` : entry.name}
                  </span>
                  {se && (
                    <>
                      <span className="text-xs flex-shrink-0" style={{ color: T.tx5 }}>|</span>
                      <span className="text-xs flex-shrink-0" style={{ color: T.tx3 }}>{se.record.type}</span>
                    </>
                  )}
                </div>
                <span className="text-xs font-medium tabular-nums flex-shrink-0 pl-3" style={{ color: T.tx1 }}>
                  {entry.value.toLocaleString('ru-RU')}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const ChartView: React.FC<ChartViewProps> = ({ selectedEntries, period }) => {
  const T = useT();
  const mode = useMode();
  const isIPMode = mode !== 'fqdn';

  if (selectedEntries.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: T.secondaryBg }}>
          <TrendingUp size={28} style={{ color: T.tx5 }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium mb-1" style={{ color: T.tx3 }}>Нет данных для отображения</p>
          <p className="text-xs max-w-xs" style={{ color: T.tx5 }}>
            Выберите записи в таблице для отображения графика
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs" style={{ background: T.secondaryBg, borderColor: T.bd1, color: T.tx4 }}>
          <Info size={12} className="text-[#0A45F5]" />
          Можно выбрать до {MAX_CHART_SELECTIONS} записей
        </div>
      </div>
    );
  }

  const fullSeries = selectedEntries[0].record.timeSeries[period];
  const pickedIndices = Array.from({ length: BREAKDOWN_COUNT }, (_, i) =>
    Math.round(i * (fullSeries.length - 1) / (BREAKDOWN_COUNT - 1))
  );
  const chartData = pickedIndices.map(idx => {
    const obj: Record<string, any> = { time: fullSeries[idx].time };
    selectedEntries.forEach(({ record }, ri) => {
      obj[`rec_${ri}`] = record.timeSeries[period][idx]?.count ?? 0;
    });
    return obj;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4">
      {/* Chart */}
      <div className="flex-1 min-h-0" style={{ minHeight: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.grd} vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: T.tx4 }}
              tickLine={false}
              axisLine={{ stroke: T.grd }}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: T.tx4 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCount}
              width={50}
            />
            <RechartsTooltip
              content={<CustomTooltip selectedEntries={selectedEntries} />}
              cursor={{ stroke: T.bd2, strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            {selectedEntries.map(({ record, domain }, i) => (
              <Line
                key={record.id}
                type="linear"
                dataKey={`rec_${i}`}
                name={isIPMode ? `${record.rrdata} → ${domain} ${record.type}` : `${domain} → ${record.rrdata} ${record.type}`}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={1.5}
                dot={{ r: 3, fill: CHART_COLORS[i % CHART_COLORS.length], strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend — FQDN → IP format always */}
      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t" style={{ borderColor: T.bd1 }}>
        {selectedEntries.map(({ record, domain }, i) => {
          const left  = isIPMode ? record.rrdata : domain;
          const right = isIPMode ? domain : record.rrdata;
          return (
            <div
              key={record.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border"
              style={{ background: T.secondaryBg, borderColor: T.bd2 }}
            >
              <div className="w-3 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="font-mono text-xs" style={{ color: T.tx3 }}>{left}</span>
              <span className="text-xs mx-0.5" style={{ color: T.tx5 }}>→</span>
              <span className="font-mono text-xs" style={{ color: T.tx2 }}>{right}</span>
              <span className={`text-[9px] px-1 py-0.5 rounded border ml-1 ${RECORD_TYPE_STYLES[record.type].bg} ${RECORD_TYPE_STYLES[record.type].text} ${RECORD_TYPE_STYLES[record.type].border}`}>
                {record.type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main PDNSWidget ──────────────────────────────────────────────────────────

interface PDNSWidgetProps { isDark?: boolean; inputMode?: InputMode; }

export function PDNSWidget({ isDark = true, inputMode = 'fqdn' }: PDNSWidgetProps) {
  const theme = useMemo(() => buildTheme(isDark), [isDark]);

  const currentData = inputMode === 'ipv4' ? mockIPv4Nodes
    : inputMode === 'ipv6' ? mockIPv6Nodes
    : mockDomains;
  const firstNodeId = currentData[0]?.id ?? '';

  const [recordTypes, setRecordTypes] = useState<RecordType[]>([...ALL_RECORD_TYPES]);
  const [period, setPeriod] = useState<PeriodType>('days');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedEntryMap, setSelectedEntryMap] = useState<Map<string, SelectedEntry>>(new Map());

  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set([
    firstNodeId, `${firstNodeId}-records`, `${firstNodeId}-subs`,
  ]));
  const [loadedSet, setLoadedSet] = useState<Set<string>>(new Set([firstNodeId]));
  const [loadingSet, setLoadingSet] = useState<Set<string>>(new Set());
  const queuedLoadRef = useRef<Set<string>>(new Set([firstNodeId]));

  // Reset state when mode changes
  useEffect(() => {
    const nid = (inputMode === 'ipv4' ? mockIPv4Nodes : inputMode === 'ipv6' ? mockIPv6Nodes : mockDomains)[0]?.id ?? '';
    setExpandedSet(new Set([nid, `${nid}-records`, `${nid}-subs`]));
    setLoadedSet(new Set([nid]));
    setLoadingSet(new Set());
    queuedLoadRef.current = new Set([nid]);
    setSelectedIds(new Set());
    setSelectedEntryMap(new Map());
    setRecordTypes(inputMode === 'ipv4' ? ['A'] : inputMode === 'ipv6' ? ['AAAA'] : [...ALL_RECORD_TYPES]);
  }, [inputMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = useCallback((id: string) => {
    setExpandedSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (!id.includes('-records') && !id.includes('-subs')) {
          next.add(`${id}-records`);
          next.add(`${id}-subs`);
        }
      }
      return next;
    });

    if (!id.includes('-records') && !id.includes('-subs') && !queuedLoadRef.current.has(id)) {
      queuedLoadRef.current.add(id);
      setLoadingSet(prev => new Set([...prev, id]));
      setTimeout(() => {
        setLoadedSet(prev => new Set([...prev, id]));
        setLoadingSet(prev => { const n = new Set(prev); n.delete(id); return n; });
      }, 650);
    }
  }, []);

  const handleSelectRecord = useCallback((record: DNSRecord, domain: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(record.id) ? next.delete(record.id) : next.size < MAX_CHART_SELECTIONS && next.add(record.id);
      return next;
    });
    setSelectedEntryMap(prev => {
      const next = new Map(prev);
      next.has(record.id)
        ? next.delete(record.id)
        : next.size < MAX_CHART_SELECTIONS && next.set(record.id, { record, domain });
      return next;
    });
  }, []);

  const selectedEntries = Array.from(selectedEntryMap.values());
  const maxReached = selectedIds.size >= MAX_CHART_SELECTIONS;
  const T = theme;

  return (
    <ThemeCtx.Provider value={theme}>
      <ModeCtx.Provider value={inputMode}>
      <div
        className="flex flex-col h-full rounded-xl overflow-hidden shadow-2xl border"
        style={{ background: T.widgetBg, borderColor: T.bd1 }}
      >
        {/* Widget header */}
        <div
          className="flex items-center px-4 py-3 border-b"
          style={{ background: T.headerBg, borderColor: T.bd1 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center border"
              style={{ background: 'rgba(10,69,245,0.12)', borderColor: 'rgba(10,69,245,0.25)' }}
            >
              <ShieldCheck size={14} className="text-[#0A45F5]" />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: T.tx1 }}>PDNS Widget</h2>
          </div>
        </div>

        {/* Filter panel */}
        <FilterPanel
          recordTypes={recordTypes}
          setRecordTypes={setRecordTypes}
          period={period}
          setPeriod={setPeriod}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedCount={selectedIds.size}
        />

        {/* Main content */}
        <div
          className={`flex-1 overflow-auto min-h-0 ${isDark ? 'pdns-scroll-dark' : 'pdns-scroll-light'}`}
        >
          {viewMode === 'table' ? (
            <div className="min-w-[860px]">
              <TableHeader period={period} />
              {currentData.map(node => (
                <DomainSection
                  key={node.id}
                  node={node}
                  segs={[]}
                  expandedSet={expandedSet}
                  loadedSet={loadedSet}
                  loadingSet={loadingSet}
                  onToggle={handleToggle}
                  selectedIds={selectedIds}
                  onSelectRecord={handleSelectRecord}
                  maxReached={maxReached}
                  period={period}
                  typeFilter={recordTypes}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-[400px]">
              <ChartView selectedEntries={selectedEntries} period={period} />
            </div>
          )}
        </div>
      </div>
      </ModeCtx.Provider>
    </ThemeCtx.Provider>
  );
}