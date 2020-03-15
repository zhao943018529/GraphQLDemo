import * as React from 'react';
import styled from 'styled-components';
import { Close } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import * as d3 from 'd3';
import * as _ from 'lodash';
const { useEffect, useState, useMemo, useRef } = React;

const DivContainer = styled.div`
  background: #f5f5f5;
  position: relative;
`;

const WrapperIconButton = styled(IconButton)`
  position: absolute;
  left: 0;
  top: 0;
`;

const DetailContainer = styled.div<{ hide: boolean }>`
  right: 0;
  bottom: 0;
  width: ${props => (props.hide ? '0px' : '600px')};
  height: ${props => (props.hide ? '0px' : '400px')};
  background: blue;
  position: absolute;
  transition: all 0.25s ease-in-out;
  overflow: hidden;
`;

const mockData = [
  {
    id: 11,
    name: 'aaa',
    color: 'green',
    children: [
      { id: 111, name: 'aaa1' },
      { id: 112, name: 'aaa2' },
      { id: 113, name: 'aaa3' }
    ]
  },
  {
    id: 22,
    name: 'bbb',
    color: '#4BD314',
    children: [
      { id: 221, name: 'bbb1' },
      { id: 222, name: 'bbb2' }
    ]
  },
  {
    id: 33,
    name: 'ccc',
    color: '#FF2424',
    children: [
      { id: 331, name: 'ccc1' },
      { id: 332, name: 'ccc2' },
      { id: 333, name: 'ccc3' },
      { id: 334, name: 'ccc4' },
      { id: 335, name: 'ccc5' }
    ]
  },
  {
    id: 44,
    name: 'ddd',
    color: '#4BD314',
    children: [
      { id: 441, name: 'ddd1' },
      { id: 442, name: 'ddd2' },
      { id: 443, name: 'ddd3' },
      { id: 444, name: 'ddd4' },
      { id: 445, name: 'ddd5' },
      { id: 446, name: 'ddd6' },
      { id: 447, name: 'ddd7' }
    ]
  },
  {
    id: 55,
    name: 'fff',
    color: '#FF2424',
    children: [
      { id: 551, name: 'fff1' },
      { id: 552, name: 'fff2' },
      { id: 553, name: 'fff3' },
      { id: 554, name: 'fff4' },
      { id: 555, name: 'fff5' },
      { id: 556, name: 'fff6' },
      { id: 557, name: 'fff7' },
      { id: 558, name: 'fff8' }
    ]
  }
];

function generateData() {
  const size = Math.floor(4 + Math.random() * 7);
  const children = _.range(size).map(() => ({
    id: _.uniqueId('aaaa'),
    name: _.uniqueId('bbbbbb')
  }));
  return {
    id: _.uniqueId('toptop'),
    name: _.uniqueId('jqka'),
    color: '#FF2424',
    children: children
  };
}

function stableSort(a, b) {
  if (a.y > b.y) {
    return 1;
  } else if (a.y < b.y) {
    return -1;
  } else {
    if (a.x > b.x) {
      return 1;
    } else if (a.x < b.x) {
      return -1;
    } else {
      return 0;
    }
  }
}

interface ILayout {
  width: number;
  left: number;
  top: number;
  right: number;
  bottom?: number;
}

interface ILinkConfig {
  width: number;
}

interface IConfig {
  limit: number;
  height: number;
  linkConfig: ILinkConfig;
}

class SpreadChart {
  private layout: ILayout;
  private config: IConfig;
  public groupWidth: number;
  public groupHeight: number;
  private originData: any;
  private context: CanvasRenderingContext2D;

  public constructor(config: IConfig, layout: ILayout) {
    this.layout = Object.assign({}, layout);
    this.config = Object.assign({}, config);
    this.init();
  }

  private init() {
    const layout = this.layout;
    this.context = document.createElement('canvas').getContext('2d');
    this.context.font = 'monospace 16px';
    this.groupWidth =
      (layout.width - layout.left - layout.right) / this.config.limit;
    this.groupHeight = this.config.height;
  }

  public updateWidth(width: number) {
    this.layout.width = width;
    this.init();
  }

  public getPositionByIndex(i: number) {
    return {
      x: (i % 3) * this.groupWidth + 0.5 * this.groupWidth,
      y: Math.floor(i / 3) * this.groupHeight + 0.5 * this.groupHeight
    };
  }

  public getViewBox() {
    if (!this.originData) {
      throw Error('execute must after set data');
    }

    return [
      -this.layout.left,
      -this.layout.top,
      this.layout.width,
      Math.max(
        this.groupHeight *
          Math.ceil(this.originData.length / this.config.limit) +
          this.layout.top,
        600
      )
    ];
  }

  private buildNodes(dragData?: any) {
    const nodes = this.originData.map((item, i) => {
      let current = null;
      if (item._node_) {
        current = item._node_;
      } else {
        current = {
          id: item.id,
          level: 0,
          data: item
        };
      }

      item._node_ = Object.assign(current, {
        index: i,
        x: (i % 3) * this.groupWidth + 0.5 * this.groupWidth,
        y: Math.floor(i / 3) * this.groupHeight + 0.5 * this.groupHeight
      });

      return current;
    });
    if (dragData) {
      const found = _.find(nodes, item => item.id === dragData.target.id);
      if (found) {
        found.x = dragData.touch.x;
        found.y = dragData.touch.y;
      }
    }

    const linkWidth = this.config.linkConfig.width;

    const nodes2 = nodes
      .filter(node => node.data.children && node.data.children.length > 0)
      .reduce((acc, node) => {
        const children = node.data.children;
        const angles = [];
        let n = children.length;
        let startAngle = 90;
        const avg = Math.floor(360 / n);
        do {
          angles.push(startAngle);
          startAngle = (startAngle + avg) % 360;
        } while (--n > 0);
        // const left = Math.ceil(children.length / 2);
        // const right = children.length - left;
        // if (left === 1) {
        //   startAngle = 270;
        // } else {
        //   startAngle = 330;
        // }

        // for (let i = 0; i < left; ++i) {
        //   angles.push(startAngle);
        //   startAngle -= 120 / (left - 1);
        // }
        // if (left === 1) {
        //   startAngle = 90;
        // } else {
        //   startAngle = 30;
        // }
        // for (let i = 0; i < right; ++i) {
        //   angles.push(startAngle);
        //   startAngle += 120 / (right - 1);
        // }

        const nodes2 = angles.map((angle, i) => {
          const item = children[i];
          let current = null;
          // eslint-disable-next-line eqeqeq
          if (item._node_ != null) {
            current = item._node_;
          } else {
            current = {
              id: _.uniqueId('node')
            };
          }
          // let y: number;
          // if (angle <= 90) {
          //   y = node.y - Math.tan(((90 - angle) * Math.PI) / 180) * l2;
          // } else if (angle <= 180) {
          //   y = node.y + Math.tan(((angle - 90) * Math.PI) / 180) * l2;
          // } else if (angle <= 270) {
          //   y = node.y + Math.tan(((270 - angle) * Math.PI) / 180) * l2;
          // } else {
          //   y = node.y - Math.tan(((angle - 270) * Math.PI) / 180) * l2;
          // }
          const x = Math.floor(
            node.x + Math.sin((angle * Math.PI) / 180) * linkWidth
          );
          const y = Math.floor(
            node.y - Math.cos((angle * Math.PI) / 180) * linkWidth
          );
          // if (angle % 180 <= 90) {
          //   );
          // } else {
          //   y = Math.floor(
          //     node.y + Math.sin((angle * Math.PI) / 180) * linkWidth
          //   );
          //   x = Math.floor(
          //     node.x - Math.cos((angle * Math.PI) / 180) * linkWidth
          //   );
          // }

          item._node_ = Object.assign(current, {
            data: children[i],
            level: 1,
            angle: angle,
            x: x,
            y: y,
            parent: node,
            index: i
          });

          return current;
        });

        node.children = nodes2;
        return acc.concat(nodes2);
      }, []);

    const links = nodes2.map(node => {
      let current = null;
      if (node._link_) {
        current = node._link_;
      } else {
        current = {
          id: _.uniqueId('link')
        };
      }
      node._link_ = Object.assign(current, {
        source: node,
        target: node.parent,
        index: node.index
      });

      return current;
    });

    this.nodes = nodes.concat(nodes2);
    this.links = links;

    return [this.nodes, this.links];
  }

  public build(data: any, dragData: any) {
    this.originData = data;

    return this.buildNodes(dragData);
  }
}

// mockData.forEach((a, i) => (a.rank = i));
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// eslint-disable-next-line react/display-name
export default function() {
  const rootRef = useRef(null);
  const toolRef = useRef<SpreadChart>(null);
  const detailRef = useRef(null);
  const [chartData, setChartData] = useState(mockData);
  const [id, setId] = useState(null);
  const [winSize, setWinSize] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragData, setDragData] = useState(null);
  const refDiv = useRef<HTMLDivElement>(null);
  const groupRef = useRef(null);
  const [settingConfig, setSetttingConfig] = useState({
    treeHeight: 360,
    circle: 10,
    linkA: 20,
    linkB: 80,
    layout: {
      left: 120,
      top: 120,
      right: 120
    }
  });

  function normalizeY(y) {
    return (
      (Math.floor(y / toolRef.current.groupHeight) + 0.5) *
      toolRef.current.groupHeight
    );
  }

  function handleDragStart(evt: React.DragEvent<HTMLElement>) {
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setData('Text', JSON.stringify(generateData()));
    return true;
  }

  function handleDragEnter(evt: React.DragEvent<HTMLElement>) {
    evt.preventDefault();
    return true;
  }

  function handleDragOver(evt: React.DragEvent<HTMLElement>) {
    evt.preventDefault();
    return false;
  }

  function handleDrop(evt: React.DragEvent<HTMLElement>) {
    const dataStr = evt.dataTransfer.getData('Text');
    const item = JSON.parse(dataStr);
    const topNodes = toolRef.current.nodes.filter(node => node.level === 0);
    const rect = evt.target.getBoundingClientRect();
    const temp = {
      x: evt.clientX - rect.left,
      y: normalizeY(evt.clientY - rect.top),
      data: item
    };
    topNodes.push(temp);
    topNodes.sort(stableSort);
    const newData = topNodes.map(item => item.data);
    if (newData.length > 6) {
      newData.pop();
    }
    setChartData(newData);
    evt.stopPropagation();
    return false;
  }

  function transformData(data, width: number, height: number) {
    // 转换每个节点对应坐标 每行显示三个
    data.forEach((item, i) => {
      const x = (i % 3) * width + 0.5 * width;
      const y = Math.floor((i / 3) * height + 0.5 * height);
      item.x = x;
      item.y = y;
    });

    return data;
  }

  function dragging(d) {
    // d3.selectAll('path.link')
    //   .interrupt()
    //   .attr('opacity', '1');
    // d3.selectAll('g.child')
    //   .interrupt()
    //   .attr('opacity', '1');
    const x = d3.event.x;
    const y = d3.event.y;
    const topNodes = toolRef.current.nodes.filter(node => node.level === 0);
    const target = _.find(topNodes, { id: d.id });
    target.x = x;
    target.y = normalizeY(y);
    topNodes.sort(stableSort);
    const newData = topNodes.map(node => node.data);
    // transformData(newData, treeWidth, settingConfig.treeHeight);
    // target.y = y;
    // target.x = x;
    // setIsDragging(true);
    setChartData(newData);
    setDragData({ target: d, touch: { x, y } });
  }

  function dragend(d) {
    const x = d3.event.x;
    const y = d3.event.y;
    const topNodes = toolRef.current.nodes.filter(node => node.level === 0);
    const target = _.find(topNodes, { id: d.id });
    target.x = x;
    target.y = normalizeY(y);
    topNodes.sort(stableSort);
    const newData = topNodes.map(node => node.data);
    setDragData(null);
    setChartData(newData);
  }

  useEffect(() => {
    setWinSize(refDiv.current.clientWidth);
  }, []);

  useEffect(() => {
    if (winSize > 0) {
      let root = null;
      let nodesContainer = null;
      let linksContainer = null;
      if (toolRef.current === null) {
        toolRef.current = new SpreadChart(
          {
            limit: 3,
            height: 400,
            linkConfig: {
              width: 140
            }
          },
          {
            width: winSize,
            left: 40,
            top: 100,
            right: 40
          }
        );
      }
      let renderData = null;
      if (id !== null) {
        renderData = chartData.filter(item => item.id === id);
      } else {
        renderData = chartData;
      }
      const [nodes, links] = toolRef.current.build(renderData, dragData);
      const viewBox = toolRef.current.getViewBox();
      if (rootRef.current == null) {
        root = d3.select('svg.myChart');
        groupRef.current = root.append('g').attr('class', 'group');
        linksContainer = groupRef.current.append('g').attr('class', 'links');
        nodesContainer = groupRef.current
          .append('g')
          .attr('class', 'nodes')
          .attr('font-family', 'monospace')
          .attr('font-size', 16);
      } else {
        root = rootRef.current;
        if (id !== null) {
        }
        nodesContainer = root.select('g.nodes');
        linksContainer = root.select('g.links');
      }
      root.attr('viewBox', viewBox);
      if (id !== null) {
        const rect = toolRef.current.getPositionByIndex(0);
        const scale = 1.4;
        const x = (viewBox[2] / 2 + viewBox[0] - rect.x) / scale;
        const y = (viewBox[3] / 2 + viewBox[1] - rect.y) / scale;
        groupRef.current.attr(
          'transform',
          `translate(${x},${y}) scale(${scale})`
        );
      } else {
        groupRef.current.attr('transform', 'translate(0,0) scale(1)');
      }
      //   if (!isDragging) {
      //     transformData(chartData, treeWidth, settingConfig.treeHeight);
      //   }

      //   function normalizeX(x) {
      //     return (Math.floor(x / treeWidth) + 0.5) * treeWidth;
      //   }

      //   function normalizeY(y) {
      //     return (
      //       (Math.floor(y / settingConfig.treeHeight) + 0.5) *
      //       settingConfig.treeHeight
      //     );
      //   }

      const drag = d3
        .drag()
        .on('drag', id === null ? dragging : null)
        .on('end', id === null ? dragend : null);

      const transition = root
        .transition()
        .duration(250)
        .ease(d3.easeLinear);

      rootRef.current = root;
      linksContainer
        .selectAll('path.link')
        .data(links, d => d.id)
        .join(
          enter => {
            const enterG = enter
              .append('path')
              .attr('class', 'link')
              .attr('fill', 'none')
              .attr('stroke', 'transparent')
              .attr(
                'd',
                d =>
                  `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y} `
              );
            enterG
              .transition(transition)
              .delay(d => d.index * 250)
              .attr('stroke', '#F79A07');

            return enterG;
          },
          update =>
            update
              .attr('stroke', '#F79A07')
              .transition(transition)
              .attr('d', d => {
                return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
              })
        );
      const nodeList = nodesContainer
        .selectAll('g.node')
        .data(
          nodes.filter(item => item.level === 0),
          d => d.id
        )
        .order()
        .join(
          enter => {
            const enterG = enter
              .append('g')
              .attr('class', 'node')
              .attr('transform', 'translate(0,0)');
            enterG
              .append('circle')
              .attr('cx', 0)
              .attr('cy', 0)
              .attr('r', 18)
              .attr('fill', d => d.data.color);
            enterG
              .append('use')
              .attr('x', -15)
              .attr('y', -15)
              .attr('width', 24)
              .attr('height', 24)
              .attr('href', '#Combined-Shape')
              .attr('fill', '#FFFFFF');

            return enterG;
          },
          update =>
            update
              .transition(transition)
              .attr('transform', d => `translate(${d.x},${d.y})`)
        )
        .call(drag)
        .on('dblclick', d => {
          setId(d.data.id);
        })
        .transition(transition)
        .attr('transform', d => `translate(${d.x},${d.y})`);

      nodesContainer
        .selectAll('g.child')
        .data(
          nodes.filter(item => item.level === 1),
          d => d.id
        )
        .join(
          enter => {
            const enterG = enter.append('g').attr('class', 'child');
            enterG
              .append('polygon')
              .attr('fill', 'none')
              .attr('stroke', '#F79A07')
              .attr('points', d => {
                const width = 16 * (d.data.name.length + 1);
                const height = 40;
                const skewWidth = 10;
                if (d.angle < 90) {
                  return `0,0 0,${-height +
                    skewWidth} ${skewWidth},${-height} ${width},${-height} ${width},${-skewWidth} ${width -
                    skewWidth},0`;
                } else if (d.angle < 180) {
                  return `0,0 ${width -
                    skewWidth},0 ${width},${skewWidth} ${width},${height} ${skewWidth},${height} 0,${height -
                    skewWidth}`;
                } else if (d.angle < 270) {
                  return `0,0 ${-width +
                    skewWidth},0 ${-width},${skewWidth} ${-width},${height} ${-skewWidth},${height} 0,${height -
                    skewWidth}`;
                } else {
                  return `0,0 0,${-height +
                    skewWidth} ${-skewWidth},${-height} ${-width},${-height} ${-width},${-skewWidth} ${-width +
                    skewWidth},0`;
                }
                // if (d.direct === 'right') {
                //   return `0,-10 10,-20 ${width},-20 ${width},10 ${width -
                //     10},20 0,20`;
                // } else {
                //   return `0,-10 -10,-20 ${-width},-20 ${-width},10 ${-width +
                //     10},20 0,20`;
                // }
              });
            enterG
              .append('polygon')
              .attr('fill', '#6b460d')
              .attr('points', d => {
                const space = 4;
                const height = 32;
                const fontSize = 16;
                const skewWidth = height / 4;
                const width = fontSize * (d.data.name.length + 1) - space * 2;
                if (d.angle < 90) {
                  return `${space},${-space} ${space},${-height -
                    space +
                    skewWidth} ${skewWidth + space},${-height - space} ${width +
                    space},${-height - space} ${width + space},${-skewWidth -
                    space} ${width - skewWidth + space},${-space} `;
                } else if (d.angle < 180) {
                  return `${space},${space} ${width -
                    skewWidth +
                    space},${space} ${width + space},${skewWidth +
                    space} ${width + space},${height + space} ${skewWidth +
                    space},${height + space} ${space},${height -
                    skewWidth +
                    space}`;
                } else if (d.angle < 270) {
                  return `${-space},${space} ${-space},${height +
                    space -
                    skewWidth} ${-skewWidth - space},${height +
                    space} ${-space - width},${height + space} ${-width -
                    space},${skewWidth + space} ${-width -
                    space +
                    skewWidth},${space}`;
                } else {
                  return `${-space},${-space} ${-space},${-height +
                    skewWidth -
                    space} ${-skewWidth - space},${-height - space} ${-width -
                    space},${-height - space} ${-width - space},${-skewWidth -
                    space} ${-width + skewWidth - space},${-space}`;
                }
                // if (d.direct === 'right') {
                //   return `${space},${-skewWidth} ${space +
                //     skewWidth},${-height / 2} ${width + space},${-height /
                //     2} ${width + space},${skewWidth} ${width +
                //     space -
                //     skewWidth},${height / 2} ${space},${height / 2}`;
                // } else {
                //   return `${-space},${-skewWidth} ${-space -
                //     skewWidth},${-height / 2} ${-space - width},${-height /
                //     2} ${-width - space},${skewWidth} ${-space -
                //     width +
                //     skewWidth},${height / 2} ${-space},${height /
                //     2} ${-space},${-skewWidth}`;
                // }
              });
            enterG
              .append('text')
              .attr('text-anchor', d => (d.angle >= 180 ? 'end' : 'start'))
              .attr('dy', d => (d.angle < 90 || d.angle >= 270 ? -16 : 24))
              .attr('dx', d => (d.angle >= 180 ? '-1em' : '1em'))
              // .attr('stroke', '#FFFFFF')
              .attr('fill', '#FFFFFF')
              .text(d => d.data.name);
            enterG.attr('transform', d => `translate(${d.x},${d.y})`);
            enterG
              .attr('opacity', 0)
              .transition(transition)
              .delay(d => d.index * 250)
              .attr('opacity', 1);
            return enterG;
          },
          update =>
            update
              .attr('opacity', 1)
              .transition(transition)
              .attr('transform', d => `translate(${d.x},${d.y})`)
        );
    }
  }, [settingConfig, chartData, winSize, id]);

  return (
    <DivContainer>
      <h1>MyChart</h1>
      <div>
        <div draggable={true} onDragStart={handleDragStart}>
          Show me
        </div>
      </div>
      <div
        ref={refDiv}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDrop={handleDrop}
      >
        <svg className="myChart">
          <defs>
            <linearGradient
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              id="linearGradient-1"
            >
              <stop stopColor="#3CF4FF" offset="0%"></stop>
              <stop stopColor="#3BA1FF" offset="100%"></stop>
            </linearGradient>
            <path
              id="Combined-Shape"
              fillRule="nonzero"
              d="M12,24 L12,22 L3,22 C1.8954305,22 1,21.1045695 1,20 L1,5 C1,3.8954305 1.8954305,3 3,3 L27,3 C28.1045695,3 29,3.8954305 29,5 L29,20 C29,21.1045695 28.1045695,22 27,22 L18,22 L18,24 L22,24 C22.5522847,24 23,24.4477153 23,25 C23,25.5522847 22.5522847,26 22,26 L8,26 C7.44771525,26 7,25.5522847 7,25 C7,24.4477153 7.44771525,24 8,24 L12,24 Z M3,6 L3,19 C3,19.5522847 3.44771525,20 4,20 L26,20 C26.5522847,20 27,19.5522847 27,19 L27,6 C27,5.44771525 26.5522847,5 26,5 L4,5 C3.44771525,5 3,5.44771525 3,6 Z M11,9 L20,9 L20,11 L11,11 L11,9 Z M6,9 L9,9 L9,11 L6,11 L6,9 Z M6,14 L9,14 L9,16 L6,16 L6,14 Z M11,14 L24,14 L24,16 L11,16 L11,14 Z"
            ></path>
          </defs>
        </svg>
      </div>
      <DetailContainer hide={id === null} ref={detailRef}>
        <WrapperIconButton onClick={() => setId(null)}>
          <Close fontSize="large" color="secondary" />
        </WrapperIconButton>
      </DetailContainer>
    </DivContainer>
  );
}
