import * as React from 'react';
import styled from 'styled-components';
import { Close } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import * as d3 from 'd3';
import * as _ from 'lodash';
const { useEffect, useState, useMemo, useRef } = React;

const DivContainer = styled.div`
  background: #00111d;
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
  const children = _.range(size).map(() => {
    const type = Math.floor(Math.random() * 1000) % 2 == 0 ? 0 : 1;
    let name;
    if (type === 1) {
      name = _.range(3)
        .map(() => Math.floor(Math.random() * 256))
        .join('.');
    } else {
      name = _.uniqueId('bbbbbb');
    }

    return {
      id: _.uniqueId('aaaa'),
      name: name,
      type: type
    };
  });

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
  height: number;
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
  font: string;
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
    this.initContext();
    this.setFont(this.config.font);
    this.configGroup();
  }

  private initContext() {
    this.context = document.createElement('canvas').getContext('2d');
  }

  private configGroup() {
    this.groupWidth =
      (this.layout.width - this.layout.left - this.layout.right) /
      this.config.limit;
    this.groupHeight = this.config.height;
  }

  private setFont(fontStr: string) {
    this.context.font = this.config.font;
  }

  public updateLayout(layout: ILayout) {
    this.layout = Object.assign(this.layout, layout);
    this.init();
  }

  public getPositionByIndex(i: number) {
    return {
      x: (i % 3) * this.groupWidth + 0.5 * this.groupWidth,
      y: Math.floor(i / 3) * this.groupHeight + 0.5 * this.groupHeight
    };
  }

  public getViewBox() {
    return [
      -this.layout.left,
      -this.layout.top,
      this.layout.width,
      this.layout.height
    ];
  }

  private normalizeY(y: number) {
    return (Math.floor(y / this.groupHeight) + 0.5) * this.groupHeight;
  }

  public addNode(item: any, x: number, y: number): any[] {
    const node = {
      id: item.id,
      level: 0,
      data: item,
      x: x,
      y: y,
      index: this.originData.length
    };
    item._node_ = node;
    this.originData.push(item);

    return this.resort();
  }

  public resort(): any[] {
    return this.originData
      .map(item => item._node_)
      .sort((a, b) => {
        const y1 = this.normalizeY(a.y);
        const y2 = this.normalizeY(b.y);
        if (y1 > y2) {
          return 1;
        } else if (y1 < y2) {
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
      })
      .map(item => item.data);
  }

  private mesureText(text: string): TextMetrics {
    return this.context.measureText(text);
  }

  public build(dragData?: IDragData) {
    if (dragData !== null && dragData !== undefined) {
      this.originData = this.resort();
    }

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
      const found = _.find(nodes, item => item.id === dragData.id);
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

          const x = Math.floor(
            node.x + Math.sin((angle * Math.PI) / 180) * linkWidth
          );
          const y = Math.floor(
            node.y - Math.cos((angle * Math.PI) / 180) * linkWidth
          );

          item._node_ = Object.assign(current, {
            data: children[i],
            level: 1,
            angle: angle,
            x: x,
            y: y,
            parent: node,
            width: Math.ceil(this.mesureText(children[i].name).width),
            index: i
          });

          return current;
        });

        node.children = nodes2;
        return acc.concat(nodes2);
      }, []);

    const links = nodes2.map(node => ({
      source: node,
      target: node.parent,
      index: node.index
    }));

    this.nodes = nodes.concat(nodes2);
    this.links = links;

    return [this.nodes, this.links];
  }

  public setData(data: any) {
    this.originData = data;
  }
}

interface ITouch {
  x: number;
  y: number;
}

interface IDragData {
  id: string;
  touch: ITouch;
}

function regularWrapper(width: number, height: number, edge: number) {
  return `M0,0 L0,${edge} M${0},${height -
    edge} L0,${height} L${edge},${height} M${width -
    edge},${height} L${width},${height} L${width},${height -
    edge} M${width},${edge} L${width},0 L${width - edge},0 M${edge},0 L0,0`;
}

function getPosition(d: any) {
  let width: number;
  let height: number;
  if (d.data.type === 1) {
    width = d.width + 6 * 2;

    height = 24;
  } else {
    width = d.width + (8 + 4) * 2;
    height = 40;
  }
  let x: number;
  let y: number;
  if (d.angle < 90) {
    x = d.x;
    y = d.y - height;
  } else if (d.angle < 180) {
    x = d.x;
    y = d.y;
  } else if (d.angle < 270) {
    x = d.x - width;
    y = d.y;
  } else {
    x = d.x - width;
    y = d.y - height;
  }

  return [x, y];
}

function generatePath(
  d: any,
  height: number,
  skewWidth: number,
  edge: number,
  delta?: { x: number; y: number }
) {
  const width = d.width + edge * 2;
  const x = (delta && delta.x) || 0;
  const y = (delta && delta.y) || 0;
  if (d.angle < 90) {
    return `M${x + skewWidth},${y} L${x + width},${y} L${x + width},${y +
      height -
      skewWidth} L${x + width - skewWidth},${y + height} L${x},${y +
      height} L${x},${y + skewWidth} z`;
  } else if (d.angle < 180) {
    return `M${x},${y} L${x + width - skewWidth},${y} L${x + width},${y +
      skewWidth} L${x + width},${y + height} L${x + skewWidth},${y +
      height} L${x},${y + height - skewWidth} z`;
  } else if (d.angle < 270) {
    return `M${x + skewWidth},${y} L${x + width},${y} L${x + width},${y +
      height -
      skewWidth} L${x + width - skewWidth},${y + height} L${x},${y +
      height} L${x},${y + skewWidth} z`;
  } else {
    return `M${x},${y} L${x + width - skewWidth},${y} L${x + width},${y +
      skewWidth} L${x + width},${y + height} L${x + skewWidth},${y +
      height} L${x},${y + height - skewWidth} z`;
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
  const [dragData, setDragData] = useState<IDragData>(null);
  const refDiv = useRef<HTMLDivElement>(null);
  const refSvg = useRef<SVGSVGElement>(null);
  const groupRef = useRef(null);
  const zoomRef = useRef(null);
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

  const delay = 150;

  function toggleDetail(id) {
    if (id === null) {
      zoomRef.current.transform(
        groupRef.current,
        d3.zoomIdentity.translate(0, 0).scale(1)
      );
      // groupRef.current.attr('transform', 'translate(0,0) scale(1)');
    } else {
      const rect = toolRef.current.getPositionByIndex(0);
      const viewBox = toolRef.current.getViewBox();
      const scale = 1.4;
      const x = (viewBox[2] / 2 + viewBox[0] - rect.x) / scale;
      const y = (viewBox[3] / 2 + viewBox[1] - rect.y) / scale;
      // groupRef.current.attr(
      //   'transform',
      //   `translate(${x},${y}) scale(${scale})`
      // );
      setTimeout(() => {
        zoomRef.current.transform(
          groupRef.current,
          d3.zoomIdentity.translate(x, y).scale(scale)
        );
      }, 0);
    }
    setId(id);
  }

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
    if (dataStr) {
      const item = JSON.parse(dataStr);
      const rect = evt.target.getBoundingClientRect();
      const newChartData = toolRef.current.addNode(
        item,
        evt.clientX - rect.left,
        evt.clientY - rect.top
      );
      if (newChartData.length > 6) {
        newChartData.pop();
      }
      setChartData(newChartData);
      evt.stopPropagation();
    }
    return false;
  }

  function dragStart() {
    const event = d3.event.sourceEvent;
    event.preventDefault();
    event.stopPropagation();
  }

  function dragging(d) {
    // d3.selectAll('path.link')
    //   .interrupt()
    //   .attr('opacity', '1');
    // d3.selectAll('g.child')
    //   .interrupt()
    //   .attr('opacity', '1');
    // const event = d3.event;
    // // event.sourceEvent.preventDefault();
    // // event.sourceEvent.stopPropagation();
    // const x = d3.event.x;
    // const y = d3.event.y;
    setDragData({
      id: d.data.id,
      touch: {
        x: d3.event.x,
        y: d3.event.y
      }
    });
    // const topNodes = toolRef.current.nodes.filter(node => node.level === 0);
    // const target = _.find(topNodes, { id: d.id });
    // target.x = x;
    // target.y = y;
    // topNodes.sort(stableSort);
    // const newData = topNodes.map(node => node.data);
    // transformData(newData, treeWidth, settingConfig.treeHeight);
    // target.y = y;
    // target.x = x;
    // setIsDragging(true);
    // setChartData(newData);
    // setDragData({ target: d, touch: { x, y } });
  }

  function dragend(d) {
    const x = d3.event.x;
    const y = d3.event.y;
    d.x = x;
    d.y = y;
    setChartData(toolRef.current.resort());
    setDragData(null);
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
            font: '16px "Segoe UI"',
            linkConfig: {
              width: 140
            }
          },
          {
            width: winSize,
            height: 900,
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
      toolRef.current.setData(renderData);
      const [nodes, links] = toolRef.current.build();

      if (rootRef.current == null) {
        root = d3.select(refSvg.current);
        groupRef.current = root.append('g').attr('class', 'group');
        linksContainer = groupRef.current.append('g').attr('class', 'links');
        nodesContainer = groupRef.current
          .append('g')
          .attr('class', 'nodes')
          .attr('font-family', 'Segoe UI')
          .attr('font-size', 16);
        zoomRef.current = d3
          .zoom()
          .scaleExtent([0.6, 1.4])
          // .filter(function() {
          //   debugger;
          //   return d3.event.ctrlKey;
          // })
          .on('zoom', function(evt) {
            const transform = d3.event.transform;
            // const t = d3.zoomIdentity
            //   .translate(transform.x, transform.y)
            //   .scale(transform.k);
            groupRef.current.attr(
              'transform',
              `translate(${transform.x},${transform.y}) scale(${transform.k})`
            );
          });
        root.attr('viewBox', toolRef.current.getViewBox());
      } else {
        root = rootRef.current;
        nodesContainer = root.select('g.nodes');
        linksContainer = root.select('g.links');
      }

      const drag = d3
        .drag()
        // .on('start', id === null ? dragStart : null)
        .on('drag', id === null ? dragging : null)
        .on('end', id === null ? dragend : null);

      root.call(zoomRef.current);
      const transition = root
        .transition()
        .duration(delay)
        .ease(d3.easeLinear);

      rootRef.current = root;
      linksContainer
        .selectAll('path.link')
        .data(links, d => `${d.source.id}-${d.target.id}`)
        .join(
          enter => {
            const enterG = enter
              .append('path')
              .attr('class', 'link')
              .attr('marker-end', 'url(#assets-arrow)')
              .attr('stroke', '#F79A07');
            enterG
              .transition(transition)
              .delay(d => d.index * delay)
              .attr(
                'd',
                d =>
                  `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y} `
              );

            return enterG;
          },
          update =>
            update.transition(transition).attr('d', d => {
              return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
            }),
          exit => exit.remove()
        );
      linksContainer
        .selectAll('text.time')
        .data(links, d => `${d.source.id}-${d.target.id}`)
        .join(
          enter => {
            const enterG = enter
              .append('text')
              .attr('class', 'time')
              .attr(
                'transform',
                d =>
                  `translate(${(d.source.x + d.target.x) / 2},${(d.source.y +
                    d.target.y) /
                    2}) rotate(${
                    d.source.angle > 180
                      ? d.source.angle - 270
                      : d.source.angle - 90
                  }) translate(${-27},0)`
              )
              .attr('stroke', '#BFBFBF');

            enterG
              .transition(transition)
              .delay(d => d.index * delay)
              .text('11:06:34');

            return enterG;
          },
          update =>
            update
              .text('11:06:34')
              .transition(transition)
              .attr(
                'transform',
                d =>
                  `translate(${(d.source.x + d.target.x) / 2},${(d.source.y +
                    d.target.y) /
                    2}) rotate(${
                    d.source.angle > 180
                      ? d.source.angle - 270
                      : d.source.angle - 90
                  }) translate(${-27},0)`
              ),
          exit => exit.remove()
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
            // enterG
            //   .append('circle')
            //   .attr('cx', 0)
            //   .attr('cy', 0)
            //   .attr('r', 18)
            //   .attr('fill', d => d.data.color);
            enterG
              .append('use')
              .attr('x', -15)
              .attr('y', -15)
              .attr('width', 30)
              .attr('height', 30)
              .attr('href', '#assets-server')
              .attr('fill', d => d.data.color);

            return enterG;
          },
          update =>
            update
              .transition(transition)
              .attr('transform', d => `translate(${d.x},${d.y})`)
        )
        .call(drag)
        .on('dblclick', d => {
          toggleDetail(d.data.id);
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
            const largeEnter = enterG.filter(d => d.data.type !== 1);
            largeEnter
              .append('path')
              .attr('fill', 'none')
              .attr('stroke', '#F79A07')
              .attr('d', d => generatePath(d, 40, 10, 12));
            largeEnter
              .append('path')
              .attr('fill', '#6b460d')
              .attr('d', d => generatePath(d, 32, 8, 8, { x: 4, y: 4 }));
            const smallG = enterG.filter(d => d.data.type === 1);
            smallG
              .append('rect')
              .attr('fill', 'rgba(0,71,108,0.41)')
              .attr('width', d => d.width + 6 * 2)
              .attr('height', 24);
            // '#3BA1FF'
            smallG
              .append('path')
              .attr('stroke', '#3BA1FF')
              .attr('fill', 'none')
              .attr('d', d => regularWrapper(d.width + 6 * 2, 24, 6));
            enterG
              .append('text')
              // .attr('text-anchor', d => (d.angle >= 180 ? 'end' : 'start'))
              .attr('dy', d => (d.data.type !== 1 ? 20 : 16))
              .attr('dx', d => (d.data.type !== 1 ? 12 : 6))
              // .attr('stroke', '#FFFFFF')
              .attr('fill', '#FFFFFF')
              .text(d => d.data.name);
            enterG.attr('transform', d => {
              const position = getPosition(d);

              return `translate(${position[0]},${position[1]})`;
            });

            enterG
              .attr('opacity', 0)
              .transition(transition)
              .delay(d => d.index * delay)
              .attr('opacity', 1);
            return enterG;
          },
          update =>
            update
              .attr('opacity', 1)
              .transition(transition)
              .attr('transform', d => {
                const position = getPosition(d);

                return `translate(${position[0]},${position[1]})`;
              })
        );
    }
  }, [settingConfig, chartData, winSize, id]);

  useEffect(() => {
    if (dragData !== null) {
      toolRef.current.build(dragData);
      const transition = rootRef.current
        .transition()
        .duration(delay)
        .ease(d3.easeLinear);
      const linkContainer = groupRef.current.select('g.links');
      // 更新link位置
      linkContainer
        .selectAll('path.link')
        .transition(transition)
        .attr('d', d => {
          return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
        });

      // 更新link文本位置
      linkContainer
        .selectAll('text.time')
        .text('11:06:34')
        .transition(transition)
        .attr(
          'transform',
          d =>
            `translate(${(d.source.x + d.target.x) / 2},${(d.source.y +
              d.target.y) /
              2}) rotate(${
              d.source.angle > 180 ? d.source.angle - 270 : d.source.angle - 90
            }) translate(${-27},0)`
        );

      // 更新主机结点
      const nodeContainer = groupRef.current.select('g.nodes');
      nodeContainer
        .selectAll('g.node')
        .transition(transition)
        .attr('transform', d => `translate(${d.x},${d.y})`);

      // 更新叶子结点
      nodeContainer
        .selectAll('g.child')
        .attr('opacity', 1)
        .transition(transition)
        .attr('transform', d => {
          const position = getPosition(d);

          return `translate(${position[0]},${position[1]})`;
        });
    }
  }, [dragData]);

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="myChart"
          ref={refSvg}
        >
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
            <symbol id="assets-server" viewBox="0 0 30 30">
              <circle cx="15" cy="15" r="15"></circle>
              <path
                d="M9,5 L21,5 C21.5522847,5 22,5.44771525 22,6 L22,24 C22,24.5522847 21.5522847,25 21,25 L9,25 C8.44771525,25 8,24.5522847 8,24 L8,6 C8,5.44771525 8.44771525,5 9,5 Z M10,7 L10,9 L20,9 L20,7 L10,7 Z M10,10 L10,11 L20,11 L20,10 L10,10 Z M10,12 L10,13 L20,13 L20,12 L10,12 Z M15,22.97702 C15.8284271,22.97702 16.5,22.3054472 16.5,21.47702 C16.5,20.6485929 15.8284271,19.97702 15,19.97702 C14.1715729,19.97702 13.5,20.6485929 13.5,21.47702 C13.5,22.3054472 14.1715729,22.97702 15,22.97702 Z M15,17 C15.2761424,17 15.5,16.7761424 15.5,16.5 C15.5,16.2238576 15.2761424,16 15,16 C14.7238576,16 14.5,16.2238576 14.5,16.5 C14.5,16.7761424 14.7238576,17 15,17 Z M15,19 C15.2761424,19 15.5,18.7761424 15.5,18.5 C15.5,18.2238576 15.2761424,18 15,18 C14.7238576,18 14.5,18.2238576 14.5,18.5 C14.5,18.7761424 14.7238576,19 15,19 Z"
                fill="#FFFFFF"
              ></path>
            </symbol>
            <marker
              id="assets-arrow"
              markerHeight="10"
              markerWidth="10"
              refX="25"
              refY="-0.5"
              orient="auto"
              viewBox="0 -5 10 10"
            >
              <path d="M0,-5L10,0L0,5" fill="context-stroke"></path>
            </marker>
          </defs>
        </svg>
      </div>
      <DetailContainer hide={id === null} ref={detailRef}>
        <WrapperIconButton onClick={() => toggleDetail(null)}>
          <Close fontSize="large" color="secondary" />
        </WrapperIconButton>
      </DetailContainer>
    </DivContainer>
  );
}
