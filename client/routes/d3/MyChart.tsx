import * as React from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import * as _ from 'lodash';
const { useEffect, useState, useMemo, useRef } = React;

const DivContainer = styled.div`
  padding: 50px 40px;
  background: #f5f5f5;
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
  l1: number;
  l2: number;
}

interface IConfig {
  limit: number;
  height: number;
  linkConfig: ILinkConfig;
}

class SpreadChart {
  private layout: ILayout;
  private config: IConfig;
  private groupWidth: number;
  private groupHeight: number;
  private originData: any;

  public constructor(config: IConfig, layout: ILayout) {
    this.layout = layout;
    this.config = config;
    this.init();
  }

  private init() {
    const layout = this.layout;
    this.groupWidth =
      (layout.width - layout.left - layout.right) / this.config.limit;
    this.groupHeight = this.config.height;
  }

  public getViewBox() {
    if (!this.originData) {
      throw Error('execute must after set data');
    }

    return [
      -this.layout.left,
      -this.layout.top,
      this.layout.width,
      this.groupHeight * Math.ceil(this.originData.length / this.config.limit)
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

    const l1 = this.config.linkConfig.l1;
    const l2 = this.config.linkConfig.l2;

    const nodes2 = nodes.reduce((acc, node) => {
      const children = node.data.children;
      const left = Math.ceil(children.length / 2);
      const right = children.length - left;
      let startAngle = 30;
      const angles = [];
      for (let i = 0; i < right; ++i) {
        angles.push(startAngle);
        startAngle += 120 / (right - 1);
      }

      startAngle = 210;

      for (let i = 0; i < left; ++i) {
        angles.push(startAngle);
        startAngle += 120 / (left - 1);
      }

      const nodes2 = angles.reverse().map((angle, i) => {
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
        let y: number;
        if (angle <= 90) {
          y = node.y - Math.tan(((90 - angle) * Math.PI) / 180) * l2;
        } else if (angle <= 180) {
          y = node.y + Math.tan(((angle - 90) * Math.PI) / 180) * l2;
        } else if (angle <= 270) {
          y = node.y + Math.tan(((270 - angle) * Math.PI) / 180) * l2;
        } else {
          y = node.y - Math.tan(((angle - 270) * Math.PI) / 180) * l2;
        }

        item._node_ = Object.assign(current, {
          data: children[i],
          level: 1,
          direct: i < left ? 'left' : 'right',
          x: node.x + (i < left ? -1 : 1) * (l1 + l2),
          y: Math.floor(y),
          parent: node
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
        bundle: {
          x: node.x + (node.direct === 'left' ? l1 : -l1),
          y: node.y
        }
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
  const [chartData, setChartData] = useState(mockData);
  const [winSize, setWinSize] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragData, setDragData] = useState(null);
  const refDiv = useRef<HTMLDivElement>(null);
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

  function normalizeY(y) {
    return (
      (Math.floor(y / settingConfig.treeHeight) + 0.5) *
      settingConfig.treeHeight
    );
  }

  useEffect(() => {
    setWinSize(refDiv.current.clientWidth);
  }, []);

  useEffect(() => {
    if (winSize > 0) {
      const layout = settingConfig.layout;
      const remainWidth = winSize - layout.left - layout.right;
      const treeWidth = Math.floor(remainWidth / 3);

      let root = null;
      let nodesContainer = null;
      let linksContainer = null;
      if (rootRef.current == null) {
        toolRef.current = new SpreadChart(
          {
            limit: 3,
            height: 360,
            linkConfig: {
              l1: 20,
              l2: 80
            }
          },
          {
            width: winSize,
            left: 100,
            top: 100,
            right: 100
          }
        );
        root = d3
          .select('svg.myChart')
          .attr('viewBox', [
            -layout.left,
            -layout.top,
            winSize,
            Math.ceil(chartData.length / 3) * 360 + layout.top
          ]);
        nodesContainer = root
          .append('g')
          .attr('class', 'nodes')
          .attr('font-family', 'sans-serif')
          .attr('font-size', 16);
        linksContainer = root.append('g').attr('class', 'links');
      } else {
        root = rootRef.current;
        nodesContainer = root.select('g.nodes');
        linksContainer = root.select('g.links');
      }

      const [nodes, links] = toolRef.current.build(chartData, dragData);
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

      function dragging(d) {
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

      const drag = d3
        .drag()
        .on('drag', dragging)
        .on('end', dragend);

      const transition = root
        .transition()
        .duration(250)
        .ease(d3.easeLinear);

      rootRef.current = root;
      linksContainer
        .selectAll('path.link')
        .data(links, d => d.id)
        .join(
          enter =>
            enter
              .append('path')
              .attr('class', 'link')
              .attr('fill', 'none')
              .attr('stroke', '#333333'),
          update =>
            update.transition(transition).attr('d', d => {
              return `M${d.source.x},${d.source.y} L${d.bundle.x},${d.bundle.y} L${d.target.x},${d.target.y}`;
            })
        )
        .transition(transition)
        .attr('d', d => {
          return `M${d.source.x},${d.source.y} L${d.bundle.x},${d.bundle.y} L${d.target.x},${d.target.y}`;
        });
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
              .attr('fill', d => d.color);
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
                const width = 16 * (d.data.name.length + 2);
                if (d.direct === 'right') {
                  return `0,-10 10,-20 ${width},-20 ${width},10 ${width -
                    10},20 0,20`;
                } else {
                  return `0,-10 -10,-20 ${-width},-20 ${-width},10 ${-width +
                    10},20 0,20`;
                }
              });
            enterG
              .append('polygon')
              .attr('fill', '#6b460d')
              .attr('points', d => {
                const space = 4;
                const height = 32;
                const fontSize = 16;
                const skewWidth = height / 2;
                const width = fontSize * (d.data.name.length + 2) - space * 2;
                if (d.direct === 'right') {
                  return `${space},${-skewWidth} ${space +
                    skewWidth},${-height / 2} ${width + space},${-height /
                    2} ${width + space},${skewWidth} ${width +
                    space -
                    skewWidth},${height / 2} ${space},${height / 2}`;
                } else {
                  return `${-space},${-skewWidth} ${-space -
                    skewWidth},${-height / 2} ${-space - width},${-height /
                    2} ${-width - space},${skewWidth} ${-space -
                    width +
                    skewWidth},${height / 2} ${-space},${height /
                    2} ${-space},${-skewWidth}`;
                }
              });
            enterG
              .append('text')
              .attr('text-anchor', d => (d.direct === 'left' ? 'end' : 'start'))
              .attr('dy', '0.40em')
              .attr('dx', d => (d.direct === 'left' ? '-1em' : '1em'))
              .attr('stroke', '#FFF')
              .text(d => d.data.name);

            return enterG;
          },
          update => update
        )
        .transition(transition)
        .attr('transform', d => `translate(${d.x},${d.y})`);
    }
  }, [settingConfig, chartData, winSize]);

  return (
    <DivContainer>
      <h1>MyChart</h1>
      <div ref={refDiv}>
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
    </DivContainer>
  );
}
