
import React, { useState, useMemo, useRef } from 'react';
import { Theme } from '../types';
import Icon from './Icon';
import { formatDate } from '../utils';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip, 
    Legend,
    Sector
} from 'recharts';

// DonutChart Component
interface DonutChartProps {
    data: { name: string; value: number; color: string }[];
    theme: Theme;
    centerLabel?: string;
    centerValue?: string;
    centerSubLabel?: string;
    legendDirection?: 'vertical' | 'horizontal';
    strokeWidth?: number;
    showLegend?: boolean;
}

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          className="transition-all duration-300"
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
};

export const DonutChart: React.FC<DonutChartProps> = ({ 
    data, 
    theme, 
    centerLabel, 
    centerValue, 
    centerSubLabel, 
    legendDirection = 'vertical', 
    strokeWidth: customStrokeWidth, 
    showLegend = true 
}) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(null);
    };

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        return value.toString();
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
                <div className={`p-3 rounded-lg shadow-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="font-bold">{item.name}</span>
                    </div>
                    <div className="flex flex-col text-xs opacity-80">
                        <span>Value: UGX {item.value.toLocaleString()}</span>
                        <span>Share: {percentage}%</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`w-full h-full flex ${legendDirection === 'horizontal' ? 'flex-col' : 'flex-col md:flex-row'} items-center justify-center gap-4`}>
            <div className="relative w-full h-full min-h-[240px] flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            {...({
                                activeIndex: activeIndex !== null ? activeIndex : undefined,
                                activeShape: renderActiveShape,
                                data: data,
                                cx: "50%",
                                cy: "50%",
                                innerRadius: "65%",
                                outerRadius: "85%",
                                paddingAngle: 4,
                                dataKey: "value",
                                onMouseEnter: onPieEnter,
                                onMouseLeave: onPieLeave,
                                stroke: "none",
                                isAnimationActive: false
                            } as any)}
                        >
                            {data.map((entry) => (
                                <Cell 
                                    key={`cell-${entry.name}`} 
                                    fill={entry.color} 
                                    style={{ 
                                        filter: activeIndex === data.indexOf(entry) ? `drop-shadow(0 0 8px ${entry.color}44)` : 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {activeIndex !== null ? (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {formatCurrency(data[activeIndex].value)}
                            </span>
                            <span className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                {data[activeIndex].name}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {centerValue || formatCurrency(total)}
                            </span>
                            <span className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                {centerSubLabel || centerLabel || 'Total'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {showLegend && (
                <div className={`flex flex-wrap ${legendDirection === 'horizontal' ? 'justify-center gap-x-6 gap-y-2' : 'flex-col gap-2'} max-w-xs`}>
                    {data.map((item, index) => (
                        <div 
                            key={`legend-${item.name}-${index}`}
                            className={`flex items-center gap-2 text-xs transition-all duration-200 cursor-pointer ${activeIndex === index ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{item.name}</span>
                            <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                {((item.value / total) * 100).toFixed(0)}%
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// AreaChart Component
interface AreaChartProps {
    data: number[];
    theme: Theme;
}

export const AreaChart: React.FC<AreaChartProps> = ({ data, theme }) => {
    const chartHeight = 180;
    const chartWidth = 500;
    const padding = { top: 5, right: 5, bottom: 20, left: 5 };
  
    const maxValue = Math.max(...data, 1);
    const yScale = (value: number) => padding.top + (chartHeight - padding.top - padding.bottom) * (1 - value / maxValue);
    const xScale = (index: number) => padding.left + index * ((chartWidth - padding.left - padding.right) / (data.length > 1 ? data.length - 1 : 1));
  
    const pathData = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(d)}`).join(' ');
    const areaPathData = `${pathData} L ${xScale(data.length - 1)},${yScale(0) + chartHeight - padding.bottom} L ${xScale(0)},${yScale(0) + chartHeight - padding.bottom} Z`;
  
    const xAxisLabels = data.map((_, i) => i + 1).filter(i => i === 1 || i % 5 === 0 || i === data.length);
  
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <defs>
          <linearGradient id="trafficAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme === 'dark' ? 'rgba(147, 197, 253, 0.3)' : 'rgba(96, 165, 250, 0.4)'}/>
            <stop offset="100%" stopColor={theme === 'dark' ? 'rgba(147, 197, 253, 0)' : 'rgba(96, 165, 250, 0)'}/>
          </linearGradient>
        </defs>
        <path d={areaPathData} fill="url(#trafficAreaGradient)" />
        <path d={pathData} fill="none" stroke={theme === 'dark' ? '#bfdbfe' : '#93c5fd'} strokeWidth="2.5" />
        {xAxisLabels.map(label => (
          <text
            key={label}
            x={xScale(label - 1)}
            y={chartHeight - 5}
            fill={theme === 'dark' ? '#64748b' : '#94a3b8'}
            fontSize="12"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
      </svg>
    );
  };


// BarChart Component
interface BarChartProps {
    data: { name: string; value: number; color?: string }[];
    theme: Theme;
    onBarClick?: (item: { name: string; value: number; color?: string }) => void;
    height?: number;
    labelInterval?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, theme, onBarClick, height = 224, labelInterval = 1 }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, name: string, value: number, color: string } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const chartHeight = height;
    const chartWidth = 800; // Increased width for better aspect ratio coverage
    const padding = { top: 20, right: 10, bottom: 30, left: 40 };

    const maxValue = Math.max(...data.map(d => d.value), 0);
    const yMax = Math.ceil(maxValue / 5) * 5 || 5;

    const xScale = (index: number) => padding.left + (chartWidth - padding.left - padding.right) / data.length * (index + 0.5);
    const yScale = (value: number) => chartHeight - padding.bottom - (value / yMax) * (chartHeight - padding.top - padding.bottom);
    const barWidth = (chartWidth - padding.left - padding.right) / data.length * 0.6;

    // Dynamic ticks based on height
    const tickCount = height < 150 ? 3 : 5;
    const yAxisTicks = Array.from({ length: tickCount + 1 }, (_, i) => yMax / tickCount * i);

    const handleMouseMove = (e: React.MouseEvent<SVGRectElement>, item: { name: string; value: number; color?: string }, index: number) => {
        if (!svgRef.current) return;
        setTooltip({
            x: xScale(index),
            y: yScale(item.value),
            name: item.name,
            value: item.value,
            color: item.color || '#facc15'
        });
    };

    const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

    return (
        <div className="relative w-full" style={{ height: `${height}px` }}>
            <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} onMouseLeave={() => setTooltip(null)} preserveAspectRatio="none">
                {/* Y-axis and grid lines */}
                {yAxisTicks.map(tick => (
                    <g key={tick}>
                        <line 
                            x1={padding.left} 
                            y1={yScale(tick)} 
                            x2={chartWidth - padding.right} 
                            y2={yScale(tick)}
                            stroke={gridColor} 
                            strokeWidth="1"
                            strokeDasharray="2,2"
                        />
                        <text
                            x={padding.left - 8}
                            y={yScale(tick) + 3}
                            fill={textColor}
                            fontSize="11"
                            textAnchor="end"
                        >
                            {Math.round(tick)}
                        </text>
                    </g>
                ))}
                
                {/* Bars */}
                {data.map((item, index) => (
                    <g key={`bar-group-${item.name}-${index}`}>
                        <rect
                            key={`bar-value-${item.name}-${index}`}
                            x={xScale(index) - barWidth / 2}
                            y={yScale(item.value)}
                            width={barWidth}
                            height={Math.max(0, yScale(0) - yScale(item.value))}
                            fill={item.color || '#facc15'}
                            className={`transition-opacity duration-200 ${onBarClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                            opacity={tooltip && tooltip.name !== item.name ? 0.5 : 1}
                            rx="4"
                            onClick={() => onBarClick && onBarClick(item)}
                        />
                        <rect
                            key={`bar-hit-${item.name}-${index}`}
                            x={xScale(index) - barWidth/2 - 5}
                            y={padding.top}
                            width={barWidth + 10}
                            height={chartHeight - padding.top - padding.bottom}
                            fill="transparent"
                            onMouseMove={(e) => handleMouseMove(e, item, index)}
                            onClick={() => onBarClick && onBarClick(item)}
                            className={onBarClick ? 'cursor-pointer' : ''}
                        />
                        {labelInterval > 0 && index % labelInterval === 0 && (
                            <text
                                key={`bar-label-${item.name}-${index}`}
                                x={xScale(index)}
                                y={chartHeight - padding.bottom + 16}
                                fill={textColor}
                                fontSize="12"
                                fontWeight="500"
                                textAnchor="middle"
                            >
                                {item.name}
                            </text>
                        )}
                    </g>
                ))}
            </svg>
            {tooltip && (
                 <div
                    className={`absolute pointer-events-none p-2 text-xs rounded shadow-lg transform -translate-x-1/2 -translate-y-full z-10 ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}
                    style={{ left: `${(tooltip.x / chartWidth) * 100}%`, top: `${(tooltip.y / chartHeight) * 100}%`, marginTop: '-8px' }}
                >
                    <div className="flex items-center mb-1">
                        <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: tooltip.color}}></div>
                        <span className="font-bold whitespace-nowrap">{tooltip.name}</span>
                    </div>
                    <span className="whitespace-nowrap">Value: {tooltip.value}</span>
                </div>
            )}
        </div>
    );
};

// LineChart Component
interface LineChartProps {
    data: { date: string; amount: number }[];
    theme: Theme;
}

export const LineChart: React.FC<LineChartProps> = ({ data, theme }) => {
    const [view, setView] = useState<'daily' | 'hourly'>('daily');
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<{ x: number, y: number, name: string, sales: number } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const chartData = useMemo(() => {
        if (view === 'hourly' && selectedDay) {
            const hourly = Array.from({ length: 24 }, (_, i) => ({
                name: `${i.toString().padStart(2, '0')}:00`,
                sales: 0
            }));
            data.forEach(tx => {
                const txDate = new Date(tx.date);
                if (txDate.toISOString().startsWith(selectedDay)) {
                    hourly[txDate.getUTCHours()].sales++;
                }
            });
            return hourly;
        } else {
            const daily = data.reduce((acc, tx) => {
                const day = new Date(tx.date).toISOString().split('T')[0];
                acc[day] = (acc[day] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            return Object.entries(daily)
                .map(([name, sales]) => ({ name, sales }))
                .sort((a, b) => a.name.localeCompare(b.name));
        }
    }, [data, view, selectedDay]);

    const chartHeight = 200;
    const chartWidth = 400;
    const padding = { top: 20, right: 20, bottom: 30, left: 30 };
    
    const maxValue = useMemo(() => Math.max(...chartData.map(d => d.sales), 1), [chartData]);
    const yScale = (value: number) => padding.top + (chartHeight - padding.top - padding.bottom) * (1 - value / maxValue);
    const xScale = (index: number) => padding.left + index * ((chartWidth - padding.left - padding.right) / (chartData.length -1 || 1));

    const yAxisLabels = useMemo(() => {
        const numTicks = 4;
        const topValue = Math.ceil(maxValue / numTicks) * numTicks;
        if (topValue === 0) return [{ y: yScale(0), label: 0 }];
        return Array.from({ length: numTicks + 1 }, (_, i) => {
            const value = Math.round((topValue / numTicks) * i);
            return { y: yScale(value), label: value };
        });
    }, [maxValue, yScale]);

    const pathData = useMemo(() => 
        chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)},${yScale(d.sales)}`).join(' '), 
        [chartData, xScale, yScale]
    );

    const areaPathData = useMemo(() => 
        chartData.length > 1 ? `${pathData} L ${xScale(chartData.length - 1)},${yScale(0)} L ${xScale(0)},${yScale(0)} Z` : `M0,0`,
        [pathData, chartData.length, xScale, yScale]
    );

    const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
        if (!svgRef.current || chartData.length === 0) return;
        const rect = svgRef.current.getBoundingClientRect();
        const svgX = (e.clientX - rect.left) * (chartWidth / rect.width);

        const index = Math.round(((svgX - padding.left) / (chartWidth - padding.left - padding.right)) * (chartData.length - 1));
        
        if (index >= 0 && index < chartData.length) {
            const item = chartData[index];
            setTooltip({
                x: xScale(index),
                y: yScale(item.sales),
                name: item.name,
                sales: item.sales
            });
        }
    };

    const handlePointClick = (day: string) => {
        setView('hourly');
        setSelectedDay(day);
    };

    const handleBackClick = () => {
        setView('daily');
        setSelectedDay(null);
    }
    const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';

    return (
        <div className="relative h-full flex flex-col">
            {view === 'hourly' && (
                <button onClick={handleBackClick} className={`flex items-center self-start mb-2 text-xs font-medium ${theme === 'dark' ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700'}`}>
                    <Icon name="chevron-left" className="h-4 w-4 mr-1"/>
                    Back to Daily View
                </button>
            )}
            <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="flex-grow">
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#facc15" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#facc15" stopOpacity="0"/>
                    </linearGradient>
                </defs>
                {yAxisLabels.map(({ y, label }) => (
                    <g key={label}>
                        <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} strokeWidth="1" strokeDasharray="2,2" />
                        <text x={padding.left - 5} y={y + 3} fill={textColor} fontSize="10" textAnchor="end">{label}</text>
                    </g>
                ))}
                
                {chartData.length > 0 && <path d={areaPathData} fill="url(#areaGradient)" />}
                {chartData.length > 0 && <path d={pathData} fill="none" stroke="#facc15" strokeWidth="2" />}

                {chartData.map((d) => (
                     <circle key={d.name} cx={xScale(chartData.indexOf(d))} cy={yScale(d.sales)} r="3" fill="#facc15" 
                             className={view === 'daily' ? 'cursor-pointer' : ''} 
                             onClick={() => view === 'daily' && handlePointClick(d.name)} />
                ))}
                
                {chartData.map((d, i, arr) => {
                    if (arr.length <= 1 || i % Math.max(1, Math.floor(arr.length / (view === 'daily' ? 7 : 8))) !== 0) return null;
                    const x = xScale(i);
                    const label = view === 'daily' ? formatDate(d.name) : d.name;
                    return <text key={`label-${d.name}`} x={x} y={chartHeight - padding.bottom + 15} fill={textColor} fontSize="10" textAnchor="middle">{label}</text>
                })}
                
                {tooltip && (
                    <g className="pointer-events-none">
                        <line
                            x1={tooltip.x}
                            y1={padding.top}
                            x2={tooltip.x}
                            y2={chartHeight - padding.bottom}
                            stroke={theme === 'dark' ? '#475569' : '#cbd5e1'}
                            strokeWidth="1"
                            strokeDasharray="3,3"
                        />
                        <circle
                            cx={tooltip.x}
                            cy={tooltip.y}
                            r="4"
                            fill="#facc15"
                            stroke={theme === 'dark' ? '#0f172a' : '#f8fafc'}
                            strokeWidth="2"
                        />
                    </g>
                )}

                <rect x={padding.left} y={padding.top} 
                      width={chartWidth - padding.left - padding.right}
                      height={chartHeight - padding.top - padding.bottom}
                      fill="transparent"
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => setTooltip(null)}
                />
            </svg>
             {tooltip && (
                <div
                    className={`absolute pointer-events-none p-2 text-xs rounded shadow-lg transform -translate-x-1/2 ${theme === 'dark' ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-900'}`}
                     style={{ 
                        left: `${(tooltip.x / chartWidth) * 100}%`, 
                        top: `${(tooltip.y / chartHeight) * 100}%`, 
                        transform: `translate(-50%, -120%)`
                    }}
                >
                    <div className="font-bold">{view === 'daily' ? formatDate(tooltip.name) : tooltip.name}</div>
                    <div>Sales: {tooltip.sales}</div>
                </div>
            )}
        </div>
    );
};
