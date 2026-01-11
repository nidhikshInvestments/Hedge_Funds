"use client"

import { useMemo } from "react"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Area } from "recharts"
import { formatAxisValue, formatCurrency } from "@/lib/utils"

interface ChartDataPoint {
  date: string
  value: number
  invested: number
}

interface PortfolioChartProps {
  data: ChartDataPoint[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    // Find properly keyed payloads
    const valuePayload = payload.find((p: any) => p.dataKey === "value")
    const investedPayload = payload.find((p: any) => p.dataKey === "invested")

    // Default to 0 or fallback to payload[0] if specific key missing (safety)
    const value = valuePayload ? Number(valuePayload.value) : payload[0] ? Number(payload[0].value) : 0
    const invested = investedPayload ? Number(investedPayload.value) : 0

    // Profit = Value - Invested
    const profit = value - invested
    // ROI = (Profit / Invested) * 100
    const roi = invested > 0 ? (profit / invested) * 100 : 0

    const entryData = payload[0].payload // original data object

    return (
      <div className="backdrop-blur-xl bg-slate-900/90 border border-slate-700/50 shadow-2xl rounded-lg md:rounded-2xl p-2 md:p-5">
        {/* MOBILE LAYOUT: Micro View */}
        <div className="block md:hidden min-w-[120px]">
          <p className="text-[9px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">{entryData.date}</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-bold text-amber-400">{formatCurrency(value)}</span>
            <span className={`text-[9px] font-bold ${roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {roi >= 0 ? "↑" : "↓"} {Math.abs(roi).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
            <div>
              <p className="text-[7px] text-slate-500 uppercase">Inv</p>
              <p className="text-[9px] font-medium text-blue-400">{formatCurrency(invested)}</p>
            </div>
            <div className="text-right">
              <p className="text-[7px] text-slate-500 uppercase">P&L</p>
              <p className={`text-[9px] font-medium ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {profit >= 0 ? "+" : ""}
                {formatCurrency(profit)}
              </p>
            </div>
          </div>
        </div>

        {/* DESKTOP LAYOUT: Full Detailed View */}
        <div className="hidden md:block min-w-[200px]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{entryData.fullDate}</p>

          <div className="mb-3 space-y-1">
            <p className="text-[10px] uppercase text-slate-500">Portfolio Value</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">
                {formatCurrency(value)}
              </p>
              <span className={`text-xs font-bold ${roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {roi >= 0 ? "↑" : "↓"} {Math.abs(roi).toFixed(2)}% ROI
              </span>
            </div>
            <p className="text-[9px] text-slate-500 mt-0.5">vs Net Invested</p>
          </div>

          <div className="mb-3 space-y-1">
            <p className="text-[10px] uppercase text-slate-500">Capital Invested</p>
            <p className="text-lg font-bold text-blue-400">{formatCurrency(invested)}</p>
          </div>

          <div className="pt-2 border-t border-white/10">
            <p className="text-[10px] uppercase text-slate-500 mb-1">Unrealized P&L</p>
            <p className={`text-sm font-bold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {profit >= 0 ? "+" : ""}
              {formatCurrency(profit)}
            </p>
          </div>
        </div>
      </div>
    )
  }
  return null
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props
  // Only render dot for main value line if needed, or both.
  // We'll stick to rendering it for the main line passed via Line prop.
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#0f172a" stroke={props.stroke || "#f59e0b"} strokeWidth={3} />
      <circle cx={cx} cy={cy} r={3} fill={props.stroke || "#f59e0b"} />
    </g>
  )
}

export default function PortfolioChart({ data }: PortfolioChartProps) {
  const chartData = useMemo(() => {
    return data.map((item, index) => {
      const date = new Date(item.date)
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
        fullDate: date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }),
        value: item.value,
        invested: item.invested,
      }
    })
  }, [data])

  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100000]
    // Consider both value and invested for domain
    const allValues = chartData.flatMap((d) => [d.value, d.invested])
    const minValue = Math.min(...allValues)
    const maxValue = Math.max(...allValues)
    const padding = (maxValue - minValue) * 0.1 || maxValue * 0.1 // 10% padding
    return [Math.floor(minValue - padding), Math.ceil(maxValue + padding)]
  }, [chartData])

  if (chartData.length === 0) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-slate-800/30">
        <div className="text-center">
          <div className="mb-3 text-5xl">📊</div>
          <p className="text-lg font-medium text-slate-400">No portfolio data available yet</p>
          <p className="text-sm text-slate-500">Performance data will appear once values are added</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[350px] md:h-[500px] w-full rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-4 md:p-6 backdrop-blur-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
              <stop offset="50%" stopColor="#eab308" stopOpacity={1} />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#eab308" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            style={{ fontSize: "13px", fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: "#475569", strokeWidth: 2 }}
            dy={10}
          />
          <YAxis
            domain={yAxisDomain}
            stroke="#64748b"
            style={{ fontSize: "13px", fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: "#475569", strokeWidth: 2 }}
            tickFormatter={formatAxisValue}
            dx={-5}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "5 5" }} />

          <Area
            type="monotone"
            dataKey="value"
            fill="url(#areaGradient)"
            stroke="none"
            animationDuration={1500}
            animationEasing="ease-in-out"
            isAnimationActive={true}
          />

          {/* Invested Calculation Line */}
          <Line
            type="stepAfter"
            dataKey="invested"
            stroke="#3b82f6" /* Blue */
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6", stroke: "#60a5fa", strokeWidth: 2 }}
            animationDuration={1500}
            isAnimationActive={true}
            connectNulls={true}
          />

          {/* Portfolio Value Line */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#f59e0b"
            strokeWidth={4}
            dot={<CustomDot stroke="#f59e0b" />}
            activeDot={{ r: 8, fill: "#eab308", stroke: "#fbbf24", strokeWidth: 3 }}
            animationDuration={1500}
            animationEasing="ease-in-out"
            isAnimationActive={true}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
