import * as React from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import * as _ from 'lodash';
const { useEffect, useState, useRef } = React;

export default function BarChart() {
  const [chartData, setChartData] = useState([
    { name: 'Coca-Cola', value: 72537, rank: 0 },
    { name: 'Microsoft', value: 70196, rank: 1 },
    { name: 'IBM', value: 53183, rank: 2 },
    { name: 'Intel', value: 39048, rank: 3 },
    { name: 'Nokia', value: 38528, rank: 4 },
    { name: 'GE', value: 38127, rank: 5 },
    { name: 'Ford', value: 36368, rank: 6 },
    { name: 'Disney', value: 33553, rank: 7 },
    { name: 'McDonald', value: 27859, rank: 8 },
    { name: 'AT&T', value: 25548, rank: 9 },
    { name: 'Marlboro', value: 22110, rank: 10 },
    { name: 'Mercedes-Benz', value: 21104, rank: 11 },
    { name: 'HP', value: 20572, rank: 12 },
    { name: 'Cisco', value: 20067, rank: 12 },
    { name: 'Toyota', value: 18823, rank: 12 },
    { name: 'Citi', value: 18809, rank: 12 },
    { name: 'Gillette', value: 17358, rank: 12 },
    { name: 'Sony', value: 16409, rank: 12 },
    { name: 'American Express', value: 16122, rank: 12 },
    { name: 'Honda', value: 15244, rank: 12 }
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
  const axisXRef = useRef(null);
  const axisYRef = useRef(null);
  const colorRef = useRef(null);
  const timeRef = useRef(null);
  const stepRef = useRef(0);

  useEffect(() => {
    let group = null;
    if (rootRef.current == null) {
      rootRef.current = d3
        .select('svg.barChart')
        .attr('viewBox', [0, 0, layout.width, layout.height] as any);
      xRef.current = d3
        .scaleBand()
        .domain(chartData.map(item => item.name))
        .rangeRound([layout.left, layout.width - layout.left - layout.right]);

      yRef.current = d3
        .scaleLinear()
        .domain([0, d3.max(chartData, item => item.value)])
        .range([layout.height - layout.bottom, layout.top]);

      colorRef.current = d3.scaleOrdinal(['M', 'F'], ['#4e79a7', '#e15759']);

      axisXRef.current = d3
        .axisBottom(xRef.current)
        .ticks(20)
        .tickSizeOuter(0);
      axisYRef.current = d3.axisLeft(yRef.current).ticks(10);
      group = rootRef.current.append('g').attr('class', 'container');
    } else {
      group = rootRef.current.select('g.container');
      xRef.current.domain(chartData.map(item => item.name));
      yRef.current.domain([0, d3.max(chartData, item => item.value)]);
    }
    const root = rootRef.current;
    const x = xRef.current;
    const y = yRef.current;
    const transition = root
      .transition()
      .duration(500)
      .ease(d3.easeLinear);
    const dx = x.step() * stepRef.current;
    group
      .selectAll('rect')
      .data(chartData, d => d.name)
      .join(
        enter =>
          enter
            .append('rect')
            .attr('fill', d => colorRef.current(d.name))
            .attr('x', d => x(d.name) + dx)
            .attr('width', x.bandwidth())
            .attr('y', y(0)),
        update => update.attr('x', d => x(d.name) + dx),
        exist =>
          exist
            .transition(transition)
            .remove()
            .attr('x', -x.bandwidth())
            .attr('y', y(0))
            .attr('height', 0)
      )
      .transition(transition)
      .attr('y', d => y(d.value))
      .attr('height', d => y(0) - y(d.value));

    group.transition(transition).attr('transform', `translate(${-dx},0)`);
    timeRef.current = setTimeout(() => {
      const newChart = chartData.slice(1);
      newChart.push({
        name: _.uniqueId('myd3'),
        value: 1000 + Math.random() * 5000,
        rank: 1
      });
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
      <div>
        <svg className="barChart"></svg>
      </div>
    </div>
  );
}
