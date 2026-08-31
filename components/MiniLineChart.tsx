import React, { useMemo } from 'react';
import { Theme } from '../types';

interface MiniLineChartProps {
    data: { value: number }[];
    theme: Theme;
    color?: string;
}

const MiniLineChart: React.FC<MiniLineChartProps> = ({ data, theme, color }) => {
    const chartHeight = 32;
    const chartWidth = 96;
    const defaultColor = theme === 'dark' ? '#6ee7b7' : '#34d399'; // green-300 / green-500

    const pathData = useMemo(() => {
        if (!data || data.length === 0) return '';
        const values = data.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;

        if (range === 0) {
            return `M 0,${chartHeight / 2} L ${chartWidth},${chartHeight / 2}`;
        }

        return data.map((d, i) => {
            const x = (i / (data.length - 1)) * chartWidth;
            const y = chartHeight - ((d.value - min) / range) * chartHeight;
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
        }).join(' ');
    }, [data]);

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            <path d={pathData} fill="none" stroke={color || defaultColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default MiniLineChart;
