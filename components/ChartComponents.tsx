'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#14b8a6', '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'];

interface ChartData {
  [key: string]: string | number;
}

// Komponen Statistik Bulanan
export function MonthlyStatsChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="bulan" 
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '12px'
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px' }}
        />
        <Bar dataKey="laporan" fill="#14b8a6" name="Total Laporan" radius={[8, 8, 0, 0]} />
        <Bar dataKey="dinilai" fill="#10b981" name="Sudah Dinilai" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Komponen Trend Rating
export function RatingTrendChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="bulan" 
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#64748b"
          style={{ fontSize: '12px' }}
          domain={[0, 5]}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '12px'
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Line 
          type="monotone" 
          dataKey="rata" 
          stroke="#8b5cf6" 
          strokeWidth={3}
          name="Rata-rata Rating"
          dot={{ fill: '#8b5cf6', r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Komponen Distribusi Unit
export function UnitDistributionChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}