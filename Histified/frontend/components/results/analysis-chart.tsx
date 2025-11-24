"use client"

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AnalysisChartProps {
  forensic: number
  osint: number
  semantic: number
}

export default function AnalysisChart({ forensic, osint, semantic }: AnalysisChartProps) {
  const data = [
    { name: "Forensic", value: forensic },
    { name: "OSINT", value: osint },
    { name: "Semantic", value: semantic },
  ]

  const COLORS = ["#d4af37", "#9b8b5c", "#d4af37"]

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Bar Chart */}
      <div className="p-6 rounded border border-border bg-surface/30">
        <h3 className="font-playfair text-lg font-bold mb-4">Score Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.1)" />
            <XAxis dataKey="name" stroke="rgba(245, 243, 240, 0.5)" />
            <YAxis stroke="rgba(245, 243, 240, 0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(26, 40, 71, 0.8)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: "6px",
              }}
              formatter={(value) => `${value.toFixed(1)}%`}
            />
            <Bar dataKey="value" fill="#d4af37" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="p-6 rounded border border-border bg-surface/30">
        <h3 className="font-playfair text-lg font-bold mb-4">Analysis Composition</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value.toFixed(0)}%`}
              outerRadius={100}
              fill="#d4af37"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(26, 40, 71, 0.8)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: "6px",
              }}
              formatter={(value) => `${value.toFixed(1)}%`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
