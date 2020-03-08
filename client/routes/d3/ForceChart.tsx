import * as React from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

const DivContainer = styled.div`
  width: 800px;
  margin: 50px auto;
`;

const { useState, useCallback, useEffect, useMemo } = React;

export default function ForceChart() {
  const [levels, setLevels] = useState([
    [{ id: 'Chaos' }],
    [{ id: 'Gaea', parents: ['Chaos'] }, { id: 'Uranus' }],
    [
      { id: 'Oceanus', parents: ['Gaea', 'Uranus'] },
      { id: 'Thethys', parents: ['Gaea', 'Uranus'] },
      { id: 'Pontus' },
      { id: 'Rhea', parents: ['Gaea', 'Uranus'] },
      { id: 'Cronus', parents: ['Gaea', 'Uranus'] },
      { id: 'Coeus', parents: ['Gaea', 'Uranus'] },
      { id: 'Phoebe', parents: ['Gaea', 'Uranus'] },
      { id: 'Crius', parents: ['Gaea', 'Uranus'] },
      { id: 'Hyperion', parents: ['Gaea', 'Uranus'] },
      { id: 'Iapetus', parents: ['Gaea', 'Uranus'] },
      { id: 'Thea', parents: ['Gaea', 'Uranus'] },
      { id: 'Themis', parents: ['Gaea', 'Uranus'] },
      { id: 'Mnemosyne', parents: ['Gaea', 'Uranus'] }
    ],
    [
      { id: 'Doris', parents: ['Oceanus', 'Thethys'] },
      { id: 'Neures', parents: ['Pontus', 'Gaea'] },
      { id: 'Dionne' },
      { id: 'Demeter', parents: ['Rhea', 'Cronus'] },
      { id: 'Hades', parents: ['Rhea', 'Cronus'] },
      { id: 'Hera', parents: ['Rhea', 'Cronus'] },
      { id: 'Alcmene' },
      { id: 'Zeus', parents: ['Rhea', 'Cronus'] },
      { id: 'Eris' },
      { id: 'Leto', parents: ['Coeus', 'Phoebe'] },
      { id: 'Amphitrite' },
      { id: 'Medusa' },
      { id: 'Poseidon', parents: ['Rhea', 'Cronus'] },
      { id: 'Hestia', parents: ['Rhea', 'Cronus'] }
    ],
    [
      { id: 'Thetis', parents: ['Doris', 'Neures'] },
      { id: 'Peleus' },
      { id: 'Anchises' },
      { id: 'Adonis' },
      { id: 'Aphrodite', parents: ['Zeus', 'Dionne'] },
      { id: 'Persephone', parents: ['Zeus', 'Demeter'] },
      { id: 'Ares', parents: ['Zeus', 'Hera'] },
      { id: 'Hephaestus', parents: ['Zeus', 'Hera'] },
      { id: 'Hebe', parents: ['Zeus', 'Hera'] },
      { id: 'Hercules', parents: ['Zeus', 'Alcmene'] },
      { id: 'Megara' },
      { id: 'Deianira' },
      { id: 'Eileithya', parents: ['Zeus', 'Hera'] },
      { id: 'Ate', parents: ['Zeus', 'Eris'] },
      { id: 'Leda' },
      { id: 'Athena', parents: ['Zeus'] },
      { id: 'Apollo', parents: ['Zeus', 'Leto'] },
      { id: 'Artemis', parents: ['Zeus', 'Leto'] },
      { id: 'Triton', parents: ['Poseidon', 'Amphitrite'] },
      { id: 'Pegasus', parents: ['Poseidon', 'Medusa'] },
      { id: 'Orion', parents: ['Poseidon'] },
      { id: 'Polyphemus', parents: ['Poseidon'] }
    ],
    [
      { id: 'Deidamia' },
      { id: 'Achilles', parents: ['Peleus', 'Thetis'] },
      { id: 'Creusa' },
      { id: 'Aeneas', parents: ['Anchises', 'Aphrodite'] },
      { id: 'Lavinia' },
      { id: 'Eros', parents: ['Hephaestus', 'Aphrodite'] },
      { id: 'Helen', parents: ['Leda', 'Zeus'] },
      { id: 'Menelaus' },
      { id: 'Polydueces', parents: ['Leda', 'Zeus'] }
    ],
    [
      { id: 'Andromache' },
      { id: 'Neoptolemus', parents: ['Deidamia', 'Achilles'] },
      { id: 'Aeneas(2)', parents: ['Creusa', 'Aeneas'] },
      { id: 'Pompilius', parents: ['Creusa', 'Aeneas'] },
      { id: 'Iulus', parents: ['Lavinia', 'Aeneas'] },
      { id: 'Hermione', parents: ['Helen', 'Menelaus'] }
    ]
  ]);
  const [data, setData] = useState({
    name: 'drag',
    x: 10,
    y: 10
  });

  useEffect(() => {
    levels.forEach((level, i) => (level.level = i));
    const nodes = levels.reduce((a, b) => a.concat(b), []);
    const nodeMap = {};
    nodes.forEach(node => (nodeMap[node.id] = node));
    nodes.forEach(
      node =>
        (node.parents = node.parents
          ? node.parents.map(key => nodeMap[key])
          : [])
    );
    levels.forEach((l, i) => {
      const index_map = {};
      l.forEach((n, j) => {
        const id = n.parents
          .map(item => item.id)
          .sort()
          .join('--');
        if (index_map[id]) {
          index_map[id].parents = index_map[id].parents.concat(n.parents);
        } else {
          index_map[id] = { id: id, parents: n.parents.slice(), level: i };
        }
        n.bundle = index_map[id];
      });
      l.bundles = Object.keys(index_map).map(id => index_map[id]);
      l.bundles.forEach((bundle, i) => (bundle.i = i));
    });
    const node_height = 16;
    const node_width = 80;
    const bundle_width = 16;
    const level_y_padding = 16;
    const links = [];
    nodes.forEach((node, i) => {
      node.parents.forEach(target =>
        links.push({ source: node, bundle: node.bundle, target })
      );
    });

    const bundles = levels.reduce((a, b) => a.concat(b.bundles), []);
    const xOffset = 2;
    const yOffset = 2;

    levels.forEach((l, i) => {
      l.bundles.length * bundle_width;
      l.forEach((n, j) => {});
    });

    const root = d3.select('svg.svgForce').attr('viewBox', [0, 0, 600, 600]);
    const dragMonitor = d3.drag().on('drag', () => {
      setData({
        name: data.name,
        x: d3.event.x,
        y: d3.event.y
      });
    });
    const svgCircle = root
      .selectAll('g.button')
      .data([data], d => d.name)
      .join(
        enter =>
          enter
            .append('g')
            .attr('class', 'button')
            .attr('transform', d => `translate(${d.x},${d.y})`),
        update =>
          update
            .transition()
            .duration(500)
            .ease(d3.easeLinear)
            .attr('transform', d => `translate(${d.x},${d.y})`)
      )
      .call(dragMonitor);
    svgCircle
      .selectAll('circle')
      .data([data], d => d.name)
      .join(enter =>
        enter
          .append('circle')
          .attr('r', 10)
          .attr('fill', 'blue')
      );
  }, [data]);

  return (
    <DivContainer>
      <div>
        <svg className="svgForce"></svg>
      </div>
    </DivContainer>
  );
}
