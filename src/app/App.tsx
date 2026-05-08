import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { PDNSWidget } from './components/pdns/PDNSWidget';
import { InputMode } from './components/pdns/types';

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [inputMode, setInputMode] = useState<InputMode>('fqdn');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: isDark ? '#0D1117' : '#F0F2F5' }}>
      {/* Workspace header bar */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{
          background: isDark ? '#0D1117' : '#FFFFFF',
          borderColor: isDark ? '#21262D' : '#D0D7DE',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="w-px h-4 mx-1" style={{ background: isDark ? '#21262D' : '#D0D7DE' }} />
          <span
            className="text-xs font-medium tracking-wide uppercase"
            style={{ color: isDark ? '#4D5566' : '#8C959F' }}
          >
            PDNS Prototype
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Input mode switcher */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-lg border"
            style={{
              background: isDark ? '#21262D' : '#F6F8FA',
              borderColor: isDark ? '#30363D' : '#D0D7DE',
            }}
          >
            {(['fqdn', 'ipv4', 'ipv6'] as InputMode[]).map(mode => {
              const active = inputMode === mode;
              const label = mode === 'fqdn' ? 'FQDN' : mode === 'ipv4' ? 'IPv4' : 'IPv6';
              return (
                <button
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  className="px-3 py-1 rounded-md text-[11px] font-medium transition-all"
                  style={{
                    background: active ? (isDark ? '#0A45F5' : '#0A45F5') : 'transparent',
                    color: active ? '#FFFFFF' : isDark ? '#7D8590' : '#57606A',
                    boxShadow: active ? '0 1px 3px rgba(10,69,245,0.35)' : 'none',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Theme toggle */}
          <div
            className="flex items-center gap-1 p-0.5 rounded-full border"
            style={{
              background: isDark ? '#21262D' : '#F6F8FA',
              borderColor: isDark ? '#30363D' : '#D0D7DE',
            }}
          >
            <button
              onClick={() => setIsDark(false)}
              title="Светлая тема"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition-all"
              style={{
                background: !isDark ? '#FFFFFF' : 'transparent',
                color: !isDark ? '#1F2328' : isDark ? '#7D8590' : '#8C959F',
                boxShadow: !isDark ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Sun size={12} />
              <span>Светлая</span>
            </button>
            <button
              onClick={() => setIsDark(true)}
              title="Тёмная тема"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition-all"
              style={{
                background: isDark ? '#161B22' : 'transparent',
                color: isDark ? '#E6EDF3' : '#57606A',
                boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
              }}
            >
              <Moon size={12} />
              <span>Тёмная</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workspace canvas */}
      <div className="flex-1 p-6 overflow-auto">
        <div
          className="relative min-h-full rounded-xl overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(circle, ${isDark ? '#21262D' : '#C8D0D8'} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            backgroundColor: isDark ? '#080C10' : '#E8ECF0',
          }}
        >
          <div className="p-6">
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              {/* PDNS Widget */}
              <div style={{ height: '680px' }}>
                <PDNSWidget isDark={isDark} inputMode={inputMode} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}