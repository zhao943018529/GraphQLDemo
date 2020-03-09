import * as React from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
const { useState, useEffect } = React;
import * as _ from 'lodash';

const mockData = [
  { id: 'aa', x: 0, y: 0, isDragging: false, color: 'blue' },
  { id: 'bb', x: 0, y: 0, isDragging: false, color: 'orange' },
  { id: 'cc', x: 0, y: 0, isDragging: false, color: 'red' }
];

const DivContainer = styled.div`
  border: 1px solid #c8c8c8;
  min-height: 600px;
`;

function initData(data) {
  //   data.sort((a, b) => a.x - b.x);
  data.forEach((item, i) => {
    item.x = i * 200 + 100;
    item.y = 200;
    item.rank = i;
  });

  return data;
}

export default function ForceChart2() {
  const [chartData, setChartData] = useState(initData(mockData));

  function dragging(d) {
    d.x = d3.event.x;
    d.y = d3.event.y;
    const newData = _.cloneDeep(chartData);
    const copyData = newData.slice(0);
    copyData.sort((a, b) => a.x - b.x);
    copyData.forEach((item, i) => (item.rank = i));

    newData
      .filter(item => item.id !== d.id)
      .forEach(item => {
        item.x = item.rank * 200 + 100;
        item.y = 200;
      });

    setChartData(newData);
  }

  function dragend(d) {
    d.isDragging = false;
    const newData = _.cloneDeep(chartData);
    const copyData = newData.slice(0);
    copyData.sort((a, b) => a.x - b.x);
    copyData.forEach((item, i) => (item.rank = i));

    newData.forEach(item => {
      item.x = item.rank * 200 + 100;
      item.y = 200;
    });
    setChartData(newData);
  }

  useEffect(() => {
    // initData(chartData);

    const myDrag = d3
      .drag()
      .on('drag', dragging)
      .on('end', dragend);

    const root = d3.select('svg.chartDemo').attr('viewBox', [0, 0, 800, 600]);
    const transition = root
      .transition()
      .duration(200)
      .ease(d3.easeLinear);
    root
      .selectAll('circle')
      .data(chartData, d => d.id)
      .order()
      .join(
        enter =>
          enter
            .append('circle')
            .attr('r', 20)
            .attr('fill', d => d.color),
        update =>
          update
            .attr('fill', d => d.color)
            .transition(transition)
            .attr('transform', d => {
              //   debugger;
              return `translate(${d.x},${d.y})`;
            })
      )
      .call(myDrag)
      .transition(transition)
      .attr('transform', d => `translate(${d.x},${d.y})`);
  }, [chartData]);

  return (
    <DivContainer>
      <div>
        <svg className="chartDemo"></svg>
      </div>
    </DivContainer>
  );
}
