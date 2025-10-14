import React, { useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import type { TelemetryData } from '../types/telemetry';

interface GraphConfig {
  id: string;
  title: string;
  unit: string;
  accessor: (data: TelemetryData) => number;
  min: number;
  max: number;
  warningThreshold: number;
  dangerThreshold: number;
  color: string;
}

const GRAPHS: GraphConfig[] = [
  {
    id: 'chamber-pressure',
    title: 'Chamber Pressure',
    unit: 'MPa',
    accessor: (data) => (data.engine?.chamberPressure || 0) / 1e6, // Convert to MPa
    min: 0,
    max: 15,
    warningThreshold: 12,
    dangerThreshold: 13.5,
    color: '#3b82f6', // blue-500
  },
  {
    id: 'engine-temp',
    title: 'Engine Temp',
    unit: 'K',
    accessor: (data) => data.engine?.engineTemp || 0,
    min: 0,
    max: 4000,
    warningThreshold: 3500,
    dangerThreshold: 3800,
    color: '#ef4444', // red-500
  },
  {
    id: 'mixture-ratio',
    title: 'Mixture Ratio (O/F)',
    unit: '',
    accessor: (data) => data.engine?.mixtureRatio || 0,
    min: 1.5,
    max: 3.5,
    warningThreshold: 2.8,
    dangerThreshold: 3.2,
    color: '#10b981', // emerald-500
  },
  {
    id: 'turbopump-rpm',
    title: 'Turbopump RPM',
    unit: 'kRPM',
    accessor: (data) => (data.engine?.turboPumpRPM || 0) / 1000,
    min: 0,
    max: 50,
    warningThreshold: 42,
    dangerThreshold: 46,
    color: '#8b5cf6', // violet-500
  },
];

interface EngineTelemetryGraphsProps {
  data: TelemetryData[];
  width?: number;
  height?: number;
  timeWindow?: number; // seconds
}

const EngineTelemetryGraphs: React.FC<EngineTelemetryGraphsProps> = ({
  data,
  width = 800,
  height = 200,
  timeWindow = 60, // 60 seconds
}) => {
  const refs = useMemo(() => {
    const refsObj: Record<string, React.RefObject<SVGSVGElement | null>> = {};
    GRAPHS.forEach(graph => {
      refsObj[graph.id] = React.useRef<SVGSVGElement>(null);
    });
    return refsObj;
  }, []);

  // Filter data to the specified time window
  const filteredData = React.useMemo(() => {
    if (!data.length) return [];
    const latestTime = data[data.length - 1].timestamp;
    return data.filter(d => d.timestamp >= latestTime - timeWindow);
  }, [data, timeWindow]);

  // Draw graphs when data changes
  useEffect(() => {
    if (filteredData.length < 2) return;

    GRAPHS.forEach(graph => {
      const ref = refs[graph.id];
      if (!ref.current) return;
      
      const svg = d3.select(ref.current);
      
      // Clear previous content
      svg.selectAll('*').remove();

      // Set up dimensions
      const margin = { top: 20, right: 30, bottom: 30, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Create scales
      const x = d3.scaleLinear()
        .domain([filteredData[0].timestamp, filteredData[filteredData.length - 1].timestamp])
        .range([0, innerWidth]);

      const y = d3.scaleLinear()
        .domain([graph.min, graph.max])
        .range([innerHeight, 0]);

      // Create line generator
      const line = d3.line<TelemetryData>()
        .x(d => x(d.timestamp))
        .y(d => y(graph.accessor(d) || 0));

      // Create SVG group for the chart
      const g = svg
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Add warning and danger zones
      g.append('rect')
        .attr('x', 0)
        .attr('y', y(graph.warningThreshold))
        .attr('width', innerWidth)
        .attr('height', y(graph.dangerThreshold) - y(graph.warningThreshold))
        .attr('fill', '#f59e0b')
        .attr('opacity', 0.2);

      g.append('rect')
        .attr('x', 0)
        .attr('y', y(graph.dangerThreshold))
        .attr('width', innerWidth)
        .attr('height', y(0) - y(graph.dangerThreshold))
        .attr('fill', '#ef4444')
        .attr('opacity', 0.2);

      // Add x-axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}s`));

      // Add y-axis
      g.append('g')
        .call(d3.axisLeft(y).ticks(5));

      // Add grid lines
      g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(() => '').ticks(5));

      // Add the line
      g.append('path')
        .datum(filteredData)
        .attr('fill', 'none')
        .attr('stroke', graph.color)
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add current value text
      const lastValue = graph.accessor(filteredData[filteredData.length - 1]);
      g.append('text')
        .attr('x', innerWidth - 10)
        .attr('y', y(lastValue) - 10)
        .attr('text-anchor', 'end')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', graph.color)
        .text(`${lastValue.toFixed(2)} ${graph.unit}`);
    });
  }, [filteredData, height, refs, timeWindow, width]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GRAPHS.map((graph) => (
          <div key={graph.id} className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-cyan-300">{graph.title}</h3>
              <div className="text-xs text-slate-400">
                Range: {graph.min}-{graph.max} {graph.unit}
              </div>
            </div>
            <div className="relative">
              <svg
                ref={refs[graph.id]}
                className="w-full h-48"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
              />
              <div className="absolute bottom-0 right-0 text-xs text-slate-500">
                Last {timeWindow}s
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngineTelemetryGraphs;
