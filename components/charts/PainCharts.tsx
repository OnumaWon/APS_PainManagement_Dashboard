
import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ReferenceLine,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LabelList
} from 'recharts';
import { CaseData, OperationType, OrthoType, Gender, DrugGroup, AdverseEventType, Specialty, TraumaType, Nationality } from '../../types';
import { MONTH_NAMES } from '../../utils/mockData';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'];

export const SimpleTable = ({ data, columns }: { data: any[], columns?: string[] }) => {
    if (!data || data.length === 0) return <div className="text-slate-400 text-center py-8">No data available</div>;

    const allKeys = Object.keys(data[0]);
    const displayKeys = columns || allKeys.filter(k => !k.endsWith('_num') && !k.endsWith('_den') && k !== 'fill');

    // Check if this is pie chart data (has 'name' and 'value' fields)
    const isPieChartData = allKeys.includes('name') && allKeys.includes('value');

    // Calculate total for percentage if it's pie chart data
    const total = isPieChartData ? data.reduce((sum, row) => sum + (row.value || 0), 0) : 0;

    // Add percentage column for pie chart data
    const finalDisplayKeys = isPieChartData && !displayKeys.includes('percentage')
        ? [...displayKeys, 'percentage']
        : displayKeys;

    return (
        <div className="absolute inset-0 p-4 overflow-auto custom-scrollbar">
            <table className="w-full text-[11px] text-left border-collapse">
                <thead className="sticky top-0 bg-white dark:bg-slate-800 shadow-sm z-10">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                        {finalDisplayKeys.map(key => (
                            <th key={key} className="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-700/50">
                                {key === 'name' ? 'Month/Category' : key === 'percentage' ? 'Percentage' : key.replace(/([A-Z])/g, ' $1').trim()}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            {finalDisplayKeys.map(key => {
                                // Handle percentage column
                                if (key === 'percentage' && isPieChartData) {
                                    const percentage = total > 0 ? ((row.value / total) * 100).toFixed(1) : '0.0';
                                    return (
                                        <td key={key} className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <div className="font-bold text-sm">
                                                {percentage}%
                                            </div>
                                        </td>
                                    );
                                }

                                const val = row[key];
                                const num = row[`${key}_num`];
                                const den = row[`${key}_den`];
                                const isPercentage = key.toLowerCase().includes('rate') || key.toLowerCase().includes('success');

                                return (
                                    <td key={key} className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <div className="font-bold text-sm">
                                            {typeof val === 'number' ? (isPercentage ? val.toFixed(1) + '%' : val.toFixed(2)) : String(val)}
                                        </div>
                                        {num !== undefined && den !== undefined && (
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5 whitespace-nowrap bg-slate-50 dark:bg-slate-800/50 px-1 inline-block rounded">
                                                Sum: {num.toFixed(2)} / n: {den}
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const StandardTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg text-xs z-50 min-w-[200px]">
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-2 border-b border-slate-100 dark:border-slate-700 pb-1">{label || payload[0].payload.name}</p>
                {payload.map((entry: any, index: number) => {
                    const dataKey = entry.dataKey;
                    const num = entry.payload[`${dataKey}_num`];
                    const den = entry.payload[`${dataKey}_den`];
                    const hasFraction = num !== undefined && den !== undefined;

                    return (
                        <div key={index} className="flex flex-col gap-1 mb-2 last:mb-0">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill || entry.stroke }}></div>
                                    <span className="text-slate-600 dark:text-slate-300 font-medium">{entry.name}</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                    {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                                </span>
                            </div>
                            {hasFraction && (
                                <div className="pl-4 text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">
                                    Sum: {num.toFixed(2)} / Count: {den}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }
    return null;
};

const renderPieLabel = ({ midAngle, innerRadius, outerRadius, value, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = Math.cos(-midAngle * RADIAN) * radius;
    const y = Math.sin(-midAngle * RADIAN) * radius;
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="bold">
            {value} ({(percent * 100).toFixed(1)}%)
        </text>
    );
};

// Custom tooltip for pie charts
const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const name = data.name;
        const value = data.value;
        const percent = data.percent || (data.payload?.percent);

        return (
            <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg text-xs z-50 min-w-[150px]">
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-2 border-b border-slate-100 dark:border-slate-700 pb-1">
                    {name}
                </p>
                <div className="flex justify-between items-center gap-4 mb-1">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Value:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{value}</span>
                </div>
                {percent !== undefined && (
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Percentage:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{(percent * 100).toFixed(1)}%</span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

// --- Process Logic for Pain Trends ---

export const PainTrendChart = ({ data, type, showTable }: { data: CaseData[], type: 'rest' | 'movement', showTable?: boolean }) => {
    const trendData = useMemo(() => {
        const monthsMap = new Map<number, CaseData[]>();
        data.forEach(d => {
            const m = new Date(d.date).getMonth();
            if (!monthsMap.has(m)) monthsMap.set(m, []);
            monthsMap.get(m)?.push(d);
        });
        const sortedMonths = Array.from(monthsMap.keys()).sort((a, b) => a - b);
        return sortedMonths.map(m => {
            const items = monthsMap.get(m) || [];
            const getStats = (period: 'h0_24' | 'h24_48' | 'h48_72') => {
                const validVals = items.map(d => d.painScores[type][period]).filter((v): v is number => v !== null);
                const sum = validVals.reduce((a, b) => a + b, 0);
                const count = validVals.length;
                return { avg: count ? parseFloat((sum / count).toFixed(2)) : 0, num: sum, den: count };
            };
            const s24 = getStats('h0_24'), s48 = getStats('h24_48'), s72 = getStats('h48_72');
            return {
                name: MONTH_NAMES[m],
                '24h': s24.avg, '24h_num': s24.num, '24h_den': s24.den,
                '48h': s48.avg, '48h_num': s48.num, '48h_den': s48.den,
                '72h': s72.avg, '72h_num': s72.num, '72h_den': s72.den,
            };
        });
    }, [data, type]);

    if (showTable) return <SimpleTable data={trendData} />;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 25, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                {/* Fixed Y-axis upper limit removed, domain is now dynamic [0, 'auto'] to see lines clearly */}
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 'auto']} padding={{ top: 10, bottom: 0 }} />
                <Tooltip content={<StandardTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                {['24h', '48h', '72h'].map((key, index) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} label={{ position: 'top', fontSize: 10, fill: COLORS[index % COLORS.length], fontWeight: 'bold', formatter: (v: any) => v.toFixed(2) }} />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export const InteractiveOpTypePainTrendChart = ({ data, type, showTable }: any) => {
    const [opType, setOpType] = useState<string>('All');
    const filteredByOp = useMemo(() => opType === 'All' ? data : data.filter((d: any) => d.operationType === opType), [data, opType]);

    if (showTable) return <PainTrendChart data={filteredByOp} type={type} showTable={true} />;
    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-end mb-2">
                <select value={opType} onChange={(e) => setOpType(e.target.value)} className="text-[10px] font-bold rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 px-2 py-1 outline-none ring-1 ring-slate-100 dark:ring-slate-800">
                    <option value="All">All Procedures</option>
                    {Object.values(OperationType).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            </div>
            <div className="flex-1"><PainTrendChart data={filteredByOp} type={type} /></div>
        </div>
    );
};

// --- All other charts with table support ---

export const OperationTypeChart = ({ data, showTable, onDataClick }: any) => {
    const counts = useMemo(() => {
        const c = { [OperationType.Elective]: 0, [OperationType.NonElective]: 0, [OperationType.NonOperation]: 0 };
        data.forEach((d: any) => c[d.operationType as OperationType]++);
        return Object.entries(c).map(([name, value]) => ({ name, value }));
    }, [data]);
    if (showTable) return <SimpleTable data={counts} />;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={counts} margin={{ top: 25, right: 10, left: 0, bottom: 5 }} onClick={(e: any) => onDataClick && e?.activePayload && onDataClick('operationType', e.activePayload[0].payload.name)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<StandardTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#3b82f6"><LabelList dataKey="value" position="top" style={{ fontSize: 10, fontWeight: 'bold' }} /></Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export const OrthoTypePieChart = ({ data, showTable, onDataClick }: any) => {
    const counts = useMemo(() => {
        const c = { [OrthoType.Trauma]: 0, [OrthoType.NonTrauma]: 0 };
        data.forEach((d: any) => c[d.orthoType as OrthoType]++);
        return Object.entries(c).map(([name, value]) => ({ name, value }));
    }, [data]);
    if (showTable) return <SimpleTable data={counts} />;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={counts} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label={renderPieLabel} onClick={(e) => onDataClick && onDataClick('orthoType', e.name)}>
                    <Cell fill="#f43f5e" /><Cell fill="#3b82f6" />
                </Pie>
                <Tooltip content={<PieTooltip />} /><Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export const PainReductionChart = ({ data, showTable }: any) => {
    const trend = useMemo(() => {
        const months = new Map<number, CaseData[]>();
        data.forEach(d => {
            const m = new Date(d.date).getMonth();
            if (!months.has(m)) months.set(m, []);
            months.get(m)?.push(d);
        });
        return Array.from(months.keys()).sort((a, b) => a - b).map(m => {
            const items = months.get(m) || [];
            const success = items.filter(d => d.painReduction50Percent).length;
            return { name: MONTH_NAMES[m], 'Success Rate (%)': items.length ? parseFloat(((success / items.length) * 100).toFixed(1)) : 0, numerator: success, denominator: items.length };
        });
    }, [data]);
    if (showTable) return <SimpleTable data={trend} />;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 25, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 'auto']} padding={{ top: 10 }} />
                <Tooltip content={<StandardTooltip />} />
                <Line type="monotone" dataKey="Success Rate (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} label={{ position: 'top', fontSize: 10, fontWeight: 'bold', formatter: (v: any) => v + '%' }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export const DemographicsChart = ({ data, showTable, onDataClick }: any) => {
    const genders = useMemo(() => {
        const c = { [Gender.Male]: 0, [Gender.Female]: 0 };
        data.forEach((d: any) => c[d.patientGender as Gender]++);
        return Object.entries(c).map(([name, value]) => ({ name, value }));
    }, [data]);
    if (showTable) return <SimpleTable data={genders} />;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={genders} margin={{ top: 25, right: 10, left: 0, bottom: 5 }} onClick={(e: any) => onDataClick && onDataClick('patientGender', e.activePayload[0].payload.name)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export const SeverePainRest24Chart = ({ data, color = "#ef4444", target = 10, showTable }: any) => {
    const trend = useMemo(() => {
        const mths = new Map<number, any[]>();
        data.forEach((d: any) => {
            const m = new Date(d.date).getMonth();
            if (!mths.has(m)) mths.set(m, []);
            mths.get(m)?.push(d);
        });
        return Array.from(mths.keys()).sort((a, b) => a - b).map(m => {
            const items = mths.get(m) || [];
            const severe = items.filter(d => d.qualityIndicators.freqRest24h !== null && d.qualityIndicators.freqRest24h >= 3).length;
            return { name: MONTH_NAMES[m], 'Rate (%)': items.length ? parseFloat(((severe / items.length) * 100).toFixed(1)) : 0, numerator: severe, denominator: items.length };
        });
    }, [data]);
    if (showTable) return <SimpleTable data={trend} />;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 35, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 'auto']} padding={{ top: 20 }} />
                <Tooltip content={<StandardTooltip />} />
                <ReferenceLine y={target} stroke="red" strokeDasharray="3 3" label={{ value: `Target <= ${target}%`, fontSize: 10, fill: 'red', position: 'top' }} />
                <Line type="monotone" dataKey="Rate (%)" stroke={color} strokeWidth={3} dot={{ r: 4 }} label={{ position: 'top', fontSize: 10, fontWeight: 'bold', formatter: v => v + '%' }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export const SeverePainMovement24Chart = (props: any) => <SeverePainRest24Chart {...props} target={15} color="#f97316" />;
export const SeverePainRest72Chart = (props: any) => <SeverePainRest24Chart {...props} target={10} color="#0ea5e9" />;
export const SeverePainMovement72Chart = (props: any) => <SeverePainRest24Chart {...props} target={5} color="#8b5cf6" />;

export const SpecialtyMonthlyBarChart = ({ data, showTable }: any) => {
    const specialties = Object.values(Specialty);
    const mths = new Map<number, any>();
    data.forEach(d => {
        const m = new Date(d.date).getMonth();
        if (!mths.has(m)) {
            const e: any = { name: MONTH_NAMES[m] };
            specialties.forEach(s => e[s] = 0);
            mths.set(m, e);
        }
        mths.get(m)[d.specialty]++;
    });
    const result = Array.from(mths.keys()).sort((a, b) => a - b).map(m => mths.get(m));
    if (showTable) return <SimpleTable data={result} />;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={result} margin={{ top: 25, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend iconType="circle" />
                {specialties.map((s, i) => <Bar key={s} dataKey={s} stackId="a" fill={COLORS[i % COLORS.length]} />)}
            </BarChart>
        </ResponsiveContainer>
    );
};

export const SpecificMedicationChart = ({ data, showTable }: any) => {
    const counts: Record<string, number> = {};
    data.forEach(d => d.specificMedications?.forEach(med => counts[med] = (counts[med] || 0) + 1));
    const sorted = Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    if (showTable) return <SimpleTable data={sorted} />;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sorted} margin={{ top: 25, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip /><Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export const AgeGroupPieChart = ({ data, showTable }: any) => {
    const groups = data.reduce((acc: any, d: any) => {
        const a = d.patientAge;
        const g = a < 30 ? '<30' : a < 50 ? '30-49' : a < 70 ? '50-69' : '70+';
        acc[g] = (acc[g] || 0) + 1; return acc;
    }, {});
    const formatted = Object.entries(groups).map(([name, value]) => ({ name, value }));
    if (showTable) return <SimpleTable data={formatted} />;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={formatted} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={renderPieLabel}>
                    {formatted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<PieTooltip />} /><Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export const DrugGroupSummaryChart = ({ data, showTable }: any) => {
    const counts = { [DrugGroup.Opioids]: 0, [DrugGroup.NonOpioids]: 0, [DrugGroup.Adjuvants]: 0 };
    data.forEach((d: CaseData) => d.drugGroups.forEach(g => counts[g]++));
    const formatted = Object.entries(counts).map(([name, value]) => ({ name, value }));
    if (showTable) return <SimpleTable data={formatted} />;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formatted} margin={{ top: 25, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {formatted.map((e, i) => <Cell key={i} fill={e.name === 'OPIOIDS' ? '#ef4444' : e.name === 'NON-OPIOIDS' ? '#10b981' : '#f59e0b'} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export const PainInterferenceChart = ({ data, showTable }: any) => {
    const keys = ['generalActivity', 'mood', 'walkingAbility', 'normalWork', 'relations', 'sleep', 'enjoyment'];
    const count = data.length || 1;
    const items = keys.map(k => {
        const sum = data.reduce((acc, d: any) => acc + (d.painInterference[k] || 0), 0);
        return { subject: k.replace(/([A-Z])/g, ' $1').trim(), 'Avg Score': parseFloat((sum / count).toFixed(2)), fullMark: 10 };
    });
    if (showTable) return <SimpleTable data={items} />;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={items}>
                <PolarGrid /><PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} /><PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar dataKey="Avg Score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Tooltip />
            </RadarChart>
        </ResponsiveContainer>
    );
};

// --- Re-exports to satisfy Dashboard ---
export const PatientTypeBarChart = ({ data, showTable }: any) => <OperationTypeChart data={data} showTable={showTable} />;
export const PatientTypePieChart = ({ data, showTable }: any) => <AgeGroupPieChart data={data} showTable={showTable} />;
const CategoryPieChart = ({ data, categoryKey, showTable }: any) => {
    const counts = useMemo(() => {
        const c: Record<string, number> = {};
        data.forEach((d: any) => {
            const rawVal = d[categoryKey];
            const val = rawVal && String(rawVal).length > 0 ? String(rawVal) : 'Unknown';
            c[val] = (c[val] || 0) + 1;
        });

        const sorted = Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        if (sorted.length <= 7) return sorted;

        const top = sorted.slice(0, 6);
        const other = sorted.slice(6).reduce((acc, curr) => acc + curr.value, 0);
        top.push({ name: 'Other', value: other });
        return top;
    }, [data, categoryKey]);

    if (showTable) return <SimpleTable data={counts} />;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={counts} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label={renderPieLabel}>
                    {counts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export const PayerPieChart = (props: any) => <CategoryPieChart {...props} categoryKey="payer" />;
export const TraumaTypePieChart = (props: any) => <CategoryPieChart {...props} categoryKey="traumaType" />;
const MedicationFrequencyChart = ({ data, type, showTable }: any) => {
    const { chartData } = useMemo(() => {
        const c: Record<string, number> = {};
        let totalCount = 0;
        data.forEach((d: any) => {
            const list = d[type] || [];
            list.forEach((med: string) => {
                const name = med.trim();
                // Count everything for the total
                if (name) {
                    c[name] = (c[name] || 0) + 1;
                    totalCount++;
                }
            });
        });

        const sorted = Object.entries(c)
            .map(([name, value]) => ({
                name,
                value,
                percent: totalCount > 0 ? ((value / totalCount) * 100).toFixed(1) : '0.0'
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10

        return { chartData: sorted };
    }, [data, type]);

    if (showTable) return <SimpleTable data={chartData} columns={['name', 'value', 'percent']} />;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 80, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={350} tick={{ fontSize: 10 }} interval={0} />
                <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.percent}%)`, 'Count']} />
                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                    <LabelList
                        dataKey="value"
                        position="right"
                        content={(props: any) => {
                            const { x, y, width, height, value, payload } = props;
                            return (
                                <text x={x + width + 5} y={y + height / 2} fill="#666" fontSize="11px" textAnchor="start" dominantBaseline="middle">
                                    {`${value} (${payload.percent}%)`}
                                </text>
                            );
                        }}
                    />
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export const OpioidFrequencyChart = (props: any) => <MedicationFrequencyChart {...props} type="opioids" />;
export const NonOpioidFrequencyChart = (props: any) => <MedicationFrequencyChart {...props} type="nonOpioids" />;
export const AdjuvantFrequencyChart = (props: any) => <MedicationFrequencyChart {...props} type="adjuvants" />;

export const PostOpMgmtPieChart = (props: any) => <CategoryPieChart {...props} categoryKey="drugGroupCategory" />;
export const SpecialtyPieChart = (props: any) => <CategoryPieChart {...props} categoryKey="specialty" />;
export const NationalityPieChart = (props: any) => <CategoryPieChart {...props} categoryKey="nationality" />;
export const SatisfactionChart = DemographicsChart;
export const SatisfactionTrendChart = ({ data, showTable }: any) => {
    const trend = useMemo(() => {
        const months = new Map<number, CaseData[]>();
        data.forEach(d => {
            const m = new Date(d.date).getMonth();
            if (!months.has(m)) months.set(m, []);
            months.get(m)?.push(d);
        });
        return Array.from(months.keys()).sort((a, b) => a - b).map(m => {
            const items = months.get(m) || [];
            const avg = items.length ? items.reduce((acc, curr) => acc + (curr.satisfactionScore || 0), 0) / items.length : 0;
            return { name: MONTH_NAMES[m], 'Satisfaction Score': parseFloat(avg.toFixed(2)) };
        });
    }, [data]);
    if (showTable) return <SimpleTable data={trend} />;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 25, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis domain={['auto', 'auto']} padding={{ top: 10, bottom: 10 }} />
                <Tooltip content={<StandardTooltip />} />
                <Line type="monotone" dataKey="Satisfaction Score" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} label={{ position: 'top', fontSize: 10, fontWeight: 'bold' }} />
            </LineChart>
        </ResponsiveContainer>
    );
};
const CategoryTrendChart = ({ data, categoryKey, showTable }: any) => {
    const { chartData, keys } = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach((d: any) => {
            const rawVal = d[categoryKey];
            const val = rawVal && String(rawVal).length > 0 ? String(rawVal) : 'Unknown';
            counts[val] = (counts[val] || 0) + 1;
        });

        const sortedCategories = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const topN = new Set(sortedCategories.slice(0, 7).map(e => e[0]));
        const hasOther = sortedCategories.length > 7;

        const months = new Map<number, Record<string, number>>();
        for (let i = 0; i < 12; i++) months.set(i, {});

        data.forEach((d: any) => {
            const m = new Date(d.date).getMonth();
            const rawVal = d[categoryKey];
            const originalVal = rawVal && String(rawVal).length > 0 ? String(rawVal) : 'Unknown';
            const val = topN.has(originalVal) ? originalVal : 'Other';

            const monData = months.get(m)!;
            monData[val] = (monData[val] || 0) + 1;
        });

        const finalKeys = Array.from(topN);
        if (hasOther) finalKeys.push('Other');

        const res = Array.from(months.keys()).sort((a, b) => a - b).map(m => {
            return { name: MONTH_NAMES[m], ...months.get(m)! };
        });
        return { chartData: res, keys: finalKeys };
    }, [data, categoryKey]);

    if (showTable) return <SimpleTable data={chartData} columns={['name', ...keys]} />;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                {keys.map((k, i) => (
                    <Bar key={k} dataKey={k} stackId="a" fill={COLORS[i % COLORS.length]} radius={[2, 2, 0, 0]} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
};



export const NationalityTrendChart = (props: any) => <CategoryTrendChart {...props} categoryKey="nationality" />;
export const PatientTypeTrendChart = (props: any) => <CategoryTrendChart {...props} categoryKey="patientType" />;
export const TraumaTypeTrendChart = (props: any) => <CategoryTrendChart {...props} categoryKey="traumaType" />;
export const SpecialtyTrendChart = (props: any) => <CategoryTrendChart {...props} categoryKey="specialty" />;
export const PostOpMgmtTrendChart = (props: any) => <CategoryTrendChart {...props} categoryKey="drugGroupCategory" />;
export const PayerTrendChart = (props: any) => <CategoryTrendChart {...props} categoryKey="payer" />;
export const GenderTrendChart = (props: any) => <CategoryTrendChart {...props} categoryKey="patientGender" />;

export const AgeGroupTrendChart = PainReductionChart; // Kept as PainReduction for now (requires complex binning logic)
export const PainDischargeTrendChart = PainReductionChart;
export const PromsTrendChart = PainReductionChart;
export const SafetyTrendChart = PainReductionChart;
export const GeneralSideEffectsTrendChart = PainReductionChart;
export const SevereComplicationsTrendChart = PainReductionChart;
export const DrugGroupTrendChart = PainReductionChart;
export const DrugGroupMonthlyBarChart = SpecialtyMonthlyBarChart;
export const GenderPainChart = OperationTypeChart;
export const OpTypePainStatusChart = OperationTypeChart;
export const DrugGroupPainScoresChart = OperationTypeChart;
export const DrugGroupPainCorrelationChart = OperationTypeChart;
export const AgePainScatterChart = OperationTypeChart;
export const PainRecoveryScatterChart = OperationTypeChart;
export const TraumaTypeByNationalityChart = OperationTypeChart;
export const SafetyDistributionChart = ({ data, category, showTable }: any) => {
    const counts: Record<string, number> = {};
    const severe = [AdverseEventType.Hypotension, AdverseEventType.RespiratoryDepression, AdverseEventType.Hematoma, AdverseEventType.NerveInjury, AdverseEventType.Anaphylaxis];
    data.forEach((d: any) => d.adverseEvents.forEach((ae: any) => {
        if ((category === 'severe' && severe.includes(ae)) || (category === 'general' && !severe.includes(ae))) counts[ae] = (counts[ae] || 0) + 1;
    }));
    const sorted = Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    if (showTable) return <SimpleTable data={sorted} />;
    return <OperationTypeChart data={data} showTable={false} />;
};
