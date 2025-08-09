// src/components/LineChart.tsx
import React from 'react';
import * as d3 from 'd3';

interface LineChartProps {
  title: string;
  data: number[];
  labels: string[];
  xLabel: string;
  yLabel: string;
  color?: string;
  width?: number;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  data,
  labels,
  xLabel,
  yLabel,
  color = '#4dabf7',
  width = 400,
  height = 200
}) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  React.useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous chart

    const xScale = d3.scalePoint()
      .domain(labels)
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data) || 1])
      .nice()
      .range([innerHeight, 0]);

    const line = d3.line<number>()
      .x((_, i) => xScale(labels[i]) || 0)
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 30)
      .attr('fill', 'currentColor')
      .text(xLabel);

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -innerHeight / 2)
      .attr('fill', 'currentColor')
      .text(yLabel);

    // Add line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', (_, i) => xScale(labels[i]) || 0)
      .attr('cy', d => yScale(d))
      .attr('r', 4)
      .attr('fill', color);

  }, [data, labels, color, innerWidth, innerHeight]);

  return (
    <div className="line-chart">
      <h4>{title}</h4>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};

export default LineChart;