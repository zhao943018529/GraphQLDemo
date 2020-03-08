import * as React from 'react';
import styled from 'styled-components';
const { useEffect, useRef, useState } = React;
import { IconButton, Icon } from '@material-ui/core';
import { FlipToBackSharp, Update } from '@material-ui/icons';
import * as d3 from 'd3';

const DivContainer = styled.div`
  width: 400px;
  margin: 50px auto;
`;

interface PieDprops {
  startAngle: number;
  endAngle: number;
  name: string;
}

function transformText(d: PieDprops) {
  const angle =
    (((d.endAngle - d.startAngle) / 2 + d.startAngle) * 180) / Math.PI;

  return `rotate(${angle - 90}) translate(${50},0) `;
}

export default function D3Shape() {
  const cacheRef = useRef(null);
  const [pieData, setPieData] = useState([
    { name: 'todo', value: 55, color: 'blue', id: 1 },
    { name: 'clock', value: 66, color: 'red', id: 2 },
    { name: 'interpolator', value: 88, color: 'orange', id: 3 },
    { name: 'graph', value: 12, color: 'green', id: 4 },
    { name: 'ql', value: 6, color: 'gray', id: 5 },
    { name: 'apollo', value: 45, color: '#c8c8c8', id: 6 }
  ]);

  const refreshData = () => {
    const newPieData = pieData.map(item => ({
      value: item.value + Math.floor(Math.random() * 100),
      color: item.color,
      id: item.id,
      name: item.name
    }));
    setPieData(newPieData);
  };

  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    let svgRoot = null;
    let nodeEnter = null;
    let textGroup = null;
    if (cacheRef.current === null) {
      svgRoot = cacheRef.current = d3
        .select('.pieChart')
        .attr('viewBox', [0, 0, 300, 300]);
      nodeEnter = svgRoot
        .append('g')
        .attr('class', 'pie')
        .attr('transform', 'translate(150,150)');
      textGroup = svgRoot
        .append('g')
        .attr('class', 'text')
        .attr('transform', 'translate(150,150)');
    } else {
      svgRoot = cacheRef.current;
      nodeEnter = svgRoot.select('.pie');
      textGroup = svgRoot.select('.text');
    }

    // divRef.current.appendChild(svgRoot.node());
    const arc = d3
      .arc()
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle)
      .innerRadius(0)
      .outerRadius(100);
    // const data = [
    //   { value: 55, color: 'blue' },
    //   { value: 66, color: 'red' },
    //   { value: 88, color: 'orange' },
    //   { value: 12, color: 'green' },
    //   { value: 6, color: 'gray' },
    //   { value: 45, color: '#c8c8c8' }
    // ];
    const arcs = d3
      .pie<any, { value: number; color: string }>()
      .value(d => d.value)(pieData);

    // const nodeEnter = svgRoot
    //   .selectAll('g')
    //   .data(arcs, d => d.id)
    //   .join(enter => enter.append('g').attr('transform', 'translate(150,150)'));
    // nodeEnter
    //   .selectAll('path')
    //   .data(arcs)
    //   .join('path')
    //   .attr('fill', d => d.data.color)
    //   .attr('d', arc);
    const transition = d3.transition().duration(1000);
    const tweenFunc = d => {
      const i = d3.interpolate(d.startAngle + 0.1, d.endAngle);

      return function(t) {
        d.endAngle = i(t);

        return arc(d);
      };
    };

    nodeEnter
      .selectAll('path')
      .data(arcs, d => d.id)
      .join(
        enter => enter.append('path'),
        update => update.transition(transition).attrTween('d', tweenFunc)
      )
      .attr('fill', d => d.data.color)
      .transition()
      .duration(1000)
      .attrTween('d', tweenFunc);

    textGroup
      .selectAll('text')
      .data(arcs)
      .join(enter =>
        enter
          .append('text')
          .attr('transform', d => transformText(d))
          .text(d => d.data.name)
      );
  }, [pieData]);

  return (
    <DivContainer>
      <IconButton color="primary" component="span" onClick={refreshData}>
        <FlipToBackSharp />
      </IconButton>
      <div>
        <svg ref={svgRef} className="pieChart"></svg>
      </div>
    </DivContainer>
  );
}
