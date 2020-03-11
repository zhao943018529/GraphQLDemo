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

  constructor(config: IConfig, layout: ILayout) {
    this.layout = layout;
    this.config = config;
    this.init();
  }

  init() {
    const layout = this.layout;
    this.groupWidth =
      (layout.width - layout.left - layout.right) / this.config.limit;
    this.groupHeight = this.config.height;
  }

  updateData(data: any) {
    this.originData = data;
  }

  getViewBox() {
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

  buildNodes(dragData) {
    const nodes = this.originData.map((item, i) => {
      return {
        level: 0,
        data: item,
        index: i,
        x: (i % 3) * this.groupWidth + 0.5 * groupWidth,
        y: Math.floor(i / 3) * this.groupHeight + 0.5 * this.groupHeight
      };
    });
    const found = _.find(topNodes, item => item.data.id === dragData.target.id);
    if (found) {
      found.x = dragData.touch.x;
      found.y = dragData.touch.y;
    }

    const l1 = this.config.linkConfig.l1;
    const l2 = this.config.linkConfig.l2;

    const nodes2 = nodes.reduce(node => {
      const children = node.data.children;
      const left = Math.ceil(children.length / 2);
      const right = children.length - left;
      const angles = [30];
      let pos = 0;
      for (let i = 1; i < right; ++i) {
        angles.push(angles[pos++] + 120 / (right - 1));
      }
      angles.push(angles[pos++] + 60);
      for (let i = 1; i < left; ++i) {
        angles.push(angles[pos++] + 120 / (left - 1));
      }

      const nodes2 = angles.map((angle, i) => {
        return {
          data: children[i],
          level: 1,
          direct: i < right ? 'right' : 'left',
          x: node.x + (i < right ? 1 : -1) * l2 + l1,
          y: node.y - Math.tan(((angle * Math.PI) / 180) * l2),
          parent: node
        };
      });

      node.children = nodes2;
    }, []);

    const links = nodes.map(node => {
      return {
        source: node,
        target: node.parent,
        bundle: {
          x: node.x + (node.direct === 'left' ? l1 : -l1),
          y: node.y
        }
      };
    });
  }

  build(data, dragData) {
    this.originData = data;
    return [this.buildNodes(dragData)];
  }
}

mockData.forEach((a, i) => (a.rank = i));
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// eslint-disable-next-line react/display-name
export default function() {
  const rootRef = useRef(null);
  const [chartData, setChartData] = useState(mockData);
  const [winSize, setWinSize] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
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
      const y = Math.floor(i / 3) * height + 0.5 * height;
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
      if (rootRef.current == null) {
        root = d3
          .select('svg.myChart')
          .attr('viewBox', [
            -layout.left,
            -layout.top,
            winSize,
            Math.ceil(chartData.length / 3) * 360 + layout.top
          ]);
        nodesContainer = root.append('g').attr('class', 'nodes');
      } else {
        root = rootRef.current;
        nodesContainer = root.select('g.nodes');
      }

      if (!isDragging) {
        transformData(chartData, treeWidth, settingConfig.treeHeight);
      }

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
        const newData = _.cloneDeep(chartData);
        const target = _.find(newData, { id: d.id });
        target.x = x;
        target.y = normalizeY(y);
        newData.sort(stableSort);
        transformData(newData, treeWidth, settingConfig.treeHeight);
        target.y = y;
        target.x = x;
        setIsDragging(true);
        setChartData(newData);
      }

      function dragend(d) {
        const x = d3.event.x;
        const y = d3.event.y;
        const newData = _.cloneDeep(chartData);
        const target = _.find(newData, { id: d.id });
        target.x = x;
        target.y = normalizeY(y);
        newData.sort(stableSort);
        setIsDragging(false);
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

      const nodeList = nodesContainer
        .selectAll('g')
        .data(chartData, d => d.id)
        .order()
        .join(
          enter => {
            const enterG = enter
              .append('g')
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
