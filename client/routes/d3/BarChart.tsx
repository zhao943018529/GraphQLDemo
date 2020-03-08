import * as React from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import { Button } from '@material-ui/core';
import * as _ from 'lodash';
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const DivContainer = styled.div`
  width: 800px;
  margin: 50px auto;
`;

interface IChartData {
  name: string;
  value: number;
}

function rank(data: IChartData[]) {
  const newArray = data.map(item => item);
  newArray.sort((a, b) => d3.descending(a.value, b.value));

  return newArray;
}

function runCache(dataRef: React.RefObject<IChartData[]>) {
  const data = dataRef.current;
  return function getPrev(name: string) {
    const index = _.findIndex(data, { name });
    return { index, prev: data[index] };
  };
}

export default function BarChart() {
  const [chartData, setChartData] = useState(
    [
      { name: 'Monday', value: 120 },
      { name: 'Tuesday', value: 20 },
      { name: 'Wensday', value: 331 },
      { name: 'Thursday', value: 39 },
      { name: 'Friday', value: 234 }
    ].sort((a, b) => d3.descending(a.value, b.value))
  );

  const y = useRef(null);
  const xAxisRef = useRef(null);
  const yGroupRef = useRef(null);
  const xGroupRef = useRef(null);
  const yAxisRef = useRef(null);
  const x = useRef(null);
  const dataRef = useRef<IChartData[]>(chartData);

  const [layout, setLayout] = useState({
    left: 28,
    top: 20,
    bottom: 20,
    barSize: 40
  });

  const getPrev = useMemo(() => runCache(dataRef), []);
  const refreshCallback = useCallback(() => {
    const newData = dataRef.current
      .map(item => ({
        name: item.name,
        value: Math.max(
          0,
          item.value +
            (Math.floor(Math.random() * 10) < 4 ? -1 : 1) *
              Math.floor(Math.random() * 1000)
        )
      }))
      .sort((a, b) => d3.descending(a.value, b.value));
    setChartData(newData);
    console.log(newData);
    y.current.domain([0, newData[0].value]);
  }, [dataRef]);

  useEffect(() => {
    const root = d3.select('svg.barChart');
    // const myPath = d3.path();
    // myPath.moveTo(100, 200);
    // myPath.bezierCurveTo(125, 240, 157, 220, 200, 300);
    // root
    //   .append('path')
    //   .attr('fill', 'none')
    //   .attr('stroke', 'orange')
    //   .attr('d', myPath.toString());
    const transition = root
      .transition()
      .duration(500)
      .ease(d3.easeLinear);
    //   const transition = root.transition().duration(1000).ease()
    // const minAndMax = d3.extent(chartData, item => item.value);
    let nodeEnter = null;
    let labels = null;
    let xGroup = null;
    if (yAxisRef.current === null) {
      root.attr('viewBox', [0, 0, 600, 400] as any);
      y.current = d3
        .scaleLinear()
        .domain([0, d3.max(chartData, item => item.value)])
        .range([400 - layout.bottom, layout.top + 40]);
      yAxisRef.current = d3
        .axisLeft(y.current)
        .ticks(8)
        .tickSizeOuter(0)
        .tickSizeInner(-5);
      x.current = d3
        .scaleBand()
        .domain(d3.range(chartData.length) as any)
        .range([
          layout.left,
          layout.left + layout.barSize * (chartData.length + 0.2)
        ])
        .padding(0.2);
      xAxisRef.current = data =>
        d3.axisBottom(x.current).tickFormat(i => data[i].name);
      xGroup = root
        .append('g')
        .attr('class', 'xAxis')
        .attr('transform', `translate(0,${400 - layout.bottom})`);
      yGroupRef.current = root
        .append('g')
        .attr('transform', `translate(${layout.left},0)`);
      nodeEnter = root
        .append('g')
        .attr('class', 'barContent')
        //   .attr('transform', `translate(${layout.left},${layout.top + 40})`)
        .attr('fill-opacity', 0.6);
      labels = root
        .append('g')
        .attr('class', 'labels')
        .style('font', 'bold 12px var(--sans-serif)')
        .style('font-variant-numeric', 'tabular-nums')
        .attr('text-anchor', 'end');
    } else {
      nodeEnter = root.select('g.barContent');
      labels = root.select('g.labels');
      xGroup = root.select('g.xAxis');
    }
    yGroupRef.current.transition(transition).call(yAxisRef.current);
    xGroup.transition(transition).call(xAxisRef.current(chartData));
    // yGroupRef.current.select('.tick:first-of-type text').remove();
    // yGroupRef.current
    //   .selectAll('.tick:not(:first-of-type) line')
    //   .attr('stroke', 'white');
    // yGroupRef.current.select('.domain').remove();
    const scaleY = y.current;
    const scaleX = x.current;
    nodeEnter
      .selectAll('rect')
      .data(chartData, d => d.name)
      .order()
      .join(
        enter =>
          enter
            .append('rect')
            .attr('fill', 'orange')
            .attr('width', scaleX.bandwidth())
            .attr('x', (d, i) => scaleX(getPrev(d.name).index as any))
            .attr('y', d => scaleY(getPrev(d.name).prev.value))
            .attr('height', d => 0),
        update =>
          update
            .attr('x', (d, i) => scaleX(getPrev(d.name).index as any))
            .attr('y', d => scaleY(getPrev(d.name).prev.value))
            .attr(
              'height',
              d => scaleY(0) - scaleY(getPrev(d.name).prev.value)
            ),
        exit => exit.remove()
      )
      .transition(transition)
      .attr('x', (d, i) => scaleX(i as any))
      .attr('y', d => scaleY(d.value))
      .attr('height', d => scaleY(0) - scaleY(d.value));

    labels
      .selectAll('text')
      .data(chartData, d => d.name)
      .order()
      .join(
        enter =>
          enter
            .append('text')
            .attr(
              'transform',
              (d, i) => `translate(${scaleX(i)},${scaleY(d.value)})`
            )
            .attr('x', scaleX.bandwidth())
            .text(d => d.name),
        update =>
          update.transition(transition).attr('transform', (d, i) => {
            return `translate(${scaleX(getPrev(d.name).index)},${scaleY(
              getPrev(d.name).prev.value
            )})`;
          })
      )
      .transition(transition)
      .attr(
        'transform',
        (d, i) => `translate(${scaleX(i)},${scaleY(d.value)})`
      );
    dataRef.current = chartData;
  }, [chartData]);

  return (
    <DivContainer>
      <Button variant="contained" color="primary" onClick={refreshCallback}>
        Refresh
      </Button>
      <div>
        <svg className="barChart"></svg>
      </div>
    </DivContainer>
  );
}
