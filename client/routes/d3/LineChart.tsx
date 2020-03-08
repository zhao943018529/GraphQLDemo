import * as React from 'react';
const { useEffect, useState, useRef, useCallback, useMemo } = React;

import * as d3 from 'd3';
import styled from 'styled-components';
import { Call } from '@material-ui/icons';

const DivContainer = styled.div`
  width: 800px;
  height: 600px;
  margin: 50px auto;
`;

export default function LineChart() {
  const [lineData, setLineData] = useState([
    { date: new Date(2007, 3, 24), value: 93.24 },
    { date: new Date(2007, 3, 25), value: 95.35 },
    { date: new Date(2007, 3, 26), value: 98.84 },
    { date: new Date(2007, 3, 27), value: 99.92 },
    { date: new Date(2007, 3, 30), value: 99.8 },
    { date: new Date(2007, 4, 1), value: 99.47 }
  ]);

  const [layout] = useState({
    left: 30,
    top: 30,
    bottom: 30
  });

  useEffect(() => {
    const root = d3.select('svg.lineChart').attr('viewBox', [0, 0, 600, 400]);
    const transition = root
      .transition()
      .duration(1000)
      .ease(d3.easeLinear);
    const x = d3
      .scaleTime()
      .domain(d3.extent(lineData, item => item.date))
      .range([layout.left, 400 - layout.bottom]);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(lineData, item => item.value)])
      .nice()
      .range([400 - layout.bottom, layout.top]);
    const yAxis = d3
      .axisLeft(y)
      .ticks(10)
      .tickSizeInner(0)
      .tickSizeOuter(4);

    const xAxis = d3.axisBottom(x).ticks(lineData.length);
    const line = d3
      .line<{ date: Date; value: number }>()
      .curve(d3.curveCatmullRom)
      .x(function(d) {
        return x(d.date);
      })
      .y(function(d) {
        return y(d.value);
      });

    root
      .append('g')
      .attr('class', 'yAxis')
      .attr('transform', `translate(${layout.left},${0})`)
      //   .transition(transition)
      .call(yAxis)
      .call(g =>
        g
          .selectAll('.tick line')
          .clone()
          .attr('x2', 400 - layout.top)
          .attr('stroke', '#c8c8c8')
      );

    root
      .append('g')
      .attr('class', 'xAxis')
      .attr('transform', `translate(0,${400 - layout.bottom})`)
      .transition(transition)
      .call(xAxis);
    const length = path =>
      d3
        .create('svg:path')
        .attr('d', path)
        .node()
        .getTotalLength();

    const l = length(line(lineData));

    const nodeEnter = root.append('g').attr('class', 'lineContent');

    nodeEnter
      .append('path')
      .datum(lineData)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', 2.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-dasharray', `0,${l}`)
      .attr('d', line)
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('stroke-dasharray', `${l},${l}`);
    root
      .append('g')
      .attr('fill', '#FFFFFF')
      .attr('stroke', '#000000')
      .attr('stroke-width', 2)
      .selectAll('circle')
      .data(lineData)
      .join('circle')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.value))
      .attr('r', 3);

    const labels = root
      .append('g')
      .attr('class', 'labels')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10);
    const label = labels
      .selectAll('g')
      .data(lineData)
      .join(
        enter =>
          enter.append('g').attr('transform', d => `translate(${x(0)},${y(0)})`)
        //   .attr('opacity', 0)
      );
    label
      .transition(transition)
      .attr('transform', d => `translate(${x(d.date)},${y(d.value)})`);

    function cloneText(text) {
      return text
        .select(function() {
          return this.parentNode.insertBefore(this.cloneNode(true), this);
        })
        .attr('fill', 'none')
        .attr('stroke', '#FFFFFF')
        .attr('stoke-width', 4)
        .attr('stroke-linejoin', 'round');
    }

    label
      .append('text')
      .text(d => d.value)
      .each(function(d) {
        const t = d3.select(this);
        switch (d.orient) {
          case 'top':
            t.attr('text-anchor', 'middle').attr('dy', '-0.75em');
            break;
          case 'bottom':
            t.attr('text-anchor', 'middle').attr('dy', '0.25em');
            break;
          case 'left':
            t.attr('text-anchor', 'end')
              .attr('dx', '-0.25em')
              .attr('dy', '0.25em');
            break;
          case 'right':
            t.attr('text-anchor', 'start')
              .attr('dx', '0.25em')
              .attr('dy', '0.25em');
            break;
          default:
            t.attr('text-anchor', 'middle').attr('dy', '-0.5em');
            break;
        }
      })
      .call(cloneText);
  }, [lineData]);

  return (
    <DivContainer>
      <div>
        <svg className="lineChart"></svg>
      </div>
    </DivContainer>
  );
}
