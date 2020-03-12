import * as React from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import * as _ from 'lodash';
const { useEffect, useState, useRef } = React;

export default function BarChart() {
  const [chartData, setChartData] = useState([
    {
      name: 'CA',
      apple: 120,
      banana: 340
    },
    {
      name: 'CF',
      apple: 777,
      banana: 223
    },
    {
      name: 'BN',
      apple: 124,
      banana: 354
    },
    {
      name: 'KA',
      apple: 236,
      banana: 178
    },
    {
      name: 'FG',
      apple: 427,
      banana: 298
    },
    {
      name: 'TJ',
      apple: 742,
      banana: 683
    },
    {
      name: 'MMA',
      apple: 539,
      banana: 275
    }
  ]);

  // const [step, setStep] = useState(0);

  const [layout] = useState({
    left: 0,
    top: 30,
    right: 0,
    bottom: 30,
    width: 600,
    height: 400
  });

  const rootRef = useRef(null);
  const xRef = useRef(null);
  const yRef = useRef(null);
  const colorRef = useRef(null);
  const timeRef = useRef(null);
  const stepRef = useRef(0);

  useEffect(() => {
    const series = d3
      .stack()
      .keys(['apple', 'banana'])(chartData)
      .map(d => (d.forEach(v => (v.key = d.key)), d));
    let group = null;
    if (rootRef.current == null) {
      //init
      rootRef.current = d3
        .select('svg.barChart')
        .attr('viewBox', [0, 0, layout.width, layout.height] as any);
      xRef.current = d3
        .scaleBand()
        .domain(chartData.map(item => item.name))
        .rangeRound([layout.left, layout.width - layout.left - layout.right]);

      yRef.current = d3
        .scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
        .range([layout.height - layout.bottom, layout.top]);

      colorRef.current = d3.scaleOrdinal(['M', 'F'], ['#4e79a7', '#e15759']);

      group = rootRef.current.append('g').attr('class', 'container');
    } else {
      group = rootRef.current.select('g.container');
      xRef.current.domain(chartData.map(item => item.name));
      yRef.current.domain([0, d3.max(series, d => d3.max(d, d => d[1]))]);
    }
    const root = rootRef.current;
    const x = xRef.current;
    const y = yRef.current;
    const transition = root
      .transition()
      .duration(500)
      .ease(d3.easeLinear);
    const dx = x.step() * stepRef.current;
    const stack = group
      .selectAll('g.stack')
      .data(series, (d, i) => i)
      .join(
        enter => enter.append('g').attr('class', 'stack'),
        update => update
      );
    stack
      .selectAll('rect')
      .data(
        d => d,
        d => d.data.name
      )
      .join(
        enter =>
          enter
            .append('rect')
            .attr('fill', d => colorRef.current(d.key))
            .attr('x', d => {
              // debugger;
              return x(d.data.name) + dx;
            })
            .attr('width', x.bandwidth())
            .attr('y', y(0)),
        update => update.attr('x', d => x(d.data.name) + dx),
        exist =>
          exist
            .transition(transition)
            .remove()
            .attr('y', d => y(0))
            .attr('height', 0)
      )
      .transition(transition)
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]));

    group.transition(transition).attr('transform', `translate(${-dx},0)`);
    timeRef.current = setTimeout(() => {
      const newChart = chartData.slice(1);
      const newItem = {
        name: _.uniqueId('myd3'),
        apple: 100 + Math.floor(Math.random() * 200),
        banana: 100 + Math.floor(Math.random() * 300)
      };
      newChart.push(newItem);
      ++stepRef.current;
      setChartData(newChart);
    }, 1000);

    return function() {
      window.clearTimeout(timeRef.current);
      timeRef.current = null;
    };
  }, [chartData]);

  return (
    <div>
      <h1>LLL</h1>
      <div style={{ width: 600, height: 400 }}>
        <svg className="barChart"></svg>
      </div>
    </div>
  );
}
