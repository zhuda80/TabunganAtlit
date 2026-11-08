import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { formatRupiah } from '../../utils/formatters';
import {
  TrendingUp,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Sparkles,
} from 'lucide-react';

export interface ChartDataPoint {
  bulan: string;
  setoran: number;
  penarikan: number;
  saldo: number;
}

interface SavingsGrowthChartProps {
  title: string;
  subtitle: string;
  data: ChartDataPoint[];
  targetEndapan?: number;
  role?: 'ADMIN' | 'ATLIT';
  badgeLabel?: string;
}

// Custom tooltip with sleek dark card styling
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl bg-slate-950/95 border border-slate-800 p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 font-bold text-slate-200">
          <span className="font-mono text-amber-400">{label}</span>
          <span className="text-[10px] text-slate-400">Periode</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            const isSaldo = entry.dataKey === 'saldo';
            const isSetoran = entry.dataKey === 'setoran';
            const isPenarikan = entry.dataKey === 'penarikan';

            let labelText = entry.name;
            let textColor = 'text-slate-300';
            if (isSaldo) {
              labelText = 'Akumulasi Saldo';
              textColor = 'text-amber-400 font-bold';
            } else if (isSetoran) {
              labelText = 'Setoran Masuk';
              textColor = 'text-emerald-400';
            } else if (isPenarikan) {
              labelText = 'Penarikan Dana';
              textColor = 'text-rose-400';
            }

            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></span>
                  <span className="text-slate-300">{labelText}:</span>
                </div>
                <span className={`font-mono ${textColor}`}>
                  {formatRupiah(Number(entry.value) || 0)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export const SavingsGrowthChart: React.FC<SavingsGrowthChartProps> = ({
  title,
  subtitle,
  data,
  targetEndapan,
  role = 'ATLIT',
  badgeLabel,
}) => {
  // Chart visual type: 'growth' (Area) | 'cashflow' (Bar)
  const [chartType, setChartType] = useState<'growth' | 'cashflow'>('growth');

  // Calculate summary metrics
  const totalSetoran = data.reduce((acc, curr) => acc + (curr.setoran || 0), 0);
  const totalPenarikan = data.reduce((acc, curr) => acc + (curr.penarikan || 0), 0);
  const netGrowth = totalSetoran - totalPenarikan;
  const latestSaldo = data.length > 0 ? data[data.length - 1].saldo : 0;
  const initialSaldo = data.length > 0 ? data[0].saldo : 0;
  const growthPercentage =
    initialSaldo > 0 ? Math.round(((latestSaldo - initialSaldo) / initialSaldo) * 100) : 100;

  const isDataEmpty =
    !data ||
    data.length === 0 ||
    (totalSetoran === 0 && totalPenarikan === 0 && latestSaldo === 0);

  // Format Y Axis Compact (e.g. 1jt, 500rb)
  const formatYAxis = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}jt`;
    }
    if (val >= 1000) {
      return `${Math.round(val / 1000)}rb`;
    }
    return `${val}`;
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            {badgeLabel && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {badgeLabel}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartType('growth')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              chartType === 'growth'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tren Pertumbuhan</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('cashflow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              chartType === 'cashflow'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Arus Kas Bulanan</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            {role === 'ADMIN' ? 'Saldo Total Cabang' : 'Saldo Tabungan'}
          </span>
          <span className="text-sm sm:text-base font-extrabold text-amber-400 font-mono block mt-0.5">
            {formatRupiah(latestSaldo)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] text-emerald-400 uppercase font-semibold flex items-center gap-1">
            <ArrowDownLeft className="w-3 h-3" />
            <span>Setoran Periode Ini</span>
          </span>
          <span className="text-sm sm:text-base font-extrabold text-white font-mono block mt-0.5">
            {formatRupiah(totalSetoran)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] text-rose-400 uppercase font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Penarikan Dana</span>
          </span>
          <span className="text-sm sm:text-base font-extrabold text-white font-mono block mt-0.5">
            {formatRupiah(totalPenarikan)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] text-sky-400 uppercase font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Pertumbuhan Bersih</span>
          </span>
          <span
            className={`text-sm sm:text-base font-extrabold font-mono block mt-0.5 ${
              netGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {netGrowth >= 0 ? `+${formatRupiah(netGrowth)}` : formatRupiah(netGrowth)}
          </span>
        </div>
      </div>

      {/* Main Interactive Recharts Canvas */}
      <div className="h-[280px] sm:h-[320px] w-full pt-2">
        {isDataEmpty ? (
          <div className="h-full w-full flex flex-col items-center justify-center rounded-2xl bg-slate-950/60 border border-slate-800/80 p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-400/80" />
            </div>
            <div className="max-w-md">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tren Pertumbuhan & Arus Kas Kosong</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Basis data belum memiliki transaksi setoran atau telah direset. Grafik visual akumulasi kas dan komparasi arus kas bulanan akan otomatis tampil setelah ada transaksi yang disetujui.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
          {chartType === 'growth' ? (
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                {/* Golden Gradient for Cumulative Savings */}
                <linearGradient id="goldAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                {/* Emerald Gradient for Deposit Flow */}
                <linearGradient id="emeraldAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.35}
                vertical={false}
              />

              <XAxis
                dataKey="bulan"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={formatYAxis}
              />

              <Tooltip content={<CustomChartTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                formatter={(value) => {
                  if (value === 'saldo') return <span className="text-amber-400 font-semibold">Akumulasi Saldo Tabungan</span>;
                  if (value === 'setoran') return <span className="text-emerald-400">Setoran Masuk</span>;
                  return value;
                }}
              />

              {/* Endapan Target Line if present */}
              {targetEndapan && targetEndapan > 0 && (
                <ReferenceLine
                  y={targetEndapan}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `Endapan: ${formatYAxis(targetEndapan)}`,
                    fill: '#f87171',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />
              )}

              <Area
                type="monotone"
                dataKey="setoran"
                name="setoran"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#emeraldAreaGradient)"
              />

              <Area
                type="monotone"
                dataKey="saldo"
                name="saldo"
                stroke="#f59e0b"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#goldAreaGradient)"
                activeDot={{ r: 6, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.35}
                vertical={false}
              />

              <XAxis
                dataKey="bulan"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={formatYAxis}
              />

              <Tooltip content={<CustomChartTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="rect"
                iconSize={10}
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                formatter={(value) => {
                  if (value === 'setoran') return <span className="text-emerald-400 font-semibold">Setoran Kas Masuk</span>;
                  if (value === 'penarikan') return <span className="text-rose-400 font-semibold">Penarikan Kas Keluar</span>;
                  return value;
                }}
              />

              <Bar
                dataKey="setoran"
                name="setoran"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />

              <Bar
                dataKey="penarikan"
                name="penarikan"
                fill="#f43f5e"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
        )}
      </div>

      {/* Chart Footer Indicator */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Grafik Saldo Kumulatif</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Setoran</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Penarikan</span>
          </span>
        </div>

        {targetEndapan && targetEndapan > 0 && (
          <div className="flex items-center gap-1.5 text-rose-300">
            <Shield className="w-3.5 h-3.5" />
            <span>Garis Merah: Saldo Endapan Wajib ({formatRupiah(targetEndapan)})</span>
          </div>
        )}
      </div>
    </div>
  );
};
