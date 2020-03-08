import * as React from 'react';
import * as d3 from 'd3';
// const useState = React.useState;
// const useCallbak = React.useCallback;
const useMemo = React.useMemo;

export default function D3Examples() {
  const color = useMemo<(text: string) => string>(
    () => d3.scaleOrdinal(d3.schemePaired.slice(7)),
    []
  );
  const population2radius = useMemo(
    () =>
      d3
        .scaleSqrt()
        .domain([0, 5000])
        .range([4, 100]),
    []
  );

  return (
    <div>
      <svg width="400" height="400" strokeWidth="4" stroke="red">
        <g
          transform="translage(50,100)"
          style={{
            textAnchor: 'middle',
            fontFamily: 'sans-serif',
            fontWeight: 'bold'
          }}
        >
          <circle r={population2radius(300)} cx={12} fill={color('China')} />
        </g>
        <polyline
          x="100"
          y="100"
          points="120 100,120 120,140 120,140 100"
          stroke="#c8c8c8"
          strokeWidth="4"
          fill="none"
        />
        <text
          x="20%"
          y="100"
          fontSize="80"
          fontFamily="sans-serif"
          fill="mediumBlue"
          stroke="gold"
          strokeWidth="8"
          paintOrder="stroke"
        >
          I am iron.
        </text>
        <linearGradient id="linearId" x2="100%" y2="100%">
          <stop offset="0" stopColor="blue" />
          <stop offset="1" stopColor="darkSeaGreen" />
        </linearGradient>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#linearId)" />
        {/* <linearGradient id="diagonal" y2="100%"> <stop offset="0" stopColor="white" /> <stop offset="0.5" stopColor="red" /> <stop offset="0.5" stopColor="blue" /> <stop offset="1" stopColor="white" />
            </linearGradient>
            <rect height="100%" width="100%" fill="url(#diagonal)" /> */}
        <linearGradient
          id="sunset"
          gradientUnits="userSpaceOnUse"
          y1="1em"
          x2="0"
          y2="250px"
        >
          {' '}
          <stop stopColor="midnightBlue" offset="0" />
          <stop stopColor="deepSkyBlue" offset="0.25" />
          <stop stopColor="yellow" offset="0.5" />
          <stop stopColor="lightPink" offset="0.8" />
          <stop stopColor="darkMagenta" offset="0.99" />
          <stop stopColor="#046" offset="0.99" />
        </linearGradient>
        <rect height="100%" width="100%" fill="dimGray" />
        <g fill="url(#sunset)">
          {' '}
          <rect x="20" y="20" width="100" height="120" />
          <rect x="280" y="20" width="100" height="120" />
          <rect x="20" y="160" width="100" height="120" />
          <rect x="280" y="160" width="100" height="120" />{' '}
        </g>
        <rect x="140" y="0" width="120" height="300" fill="url(#sunset)" />
      </svg>
    </div>
  );
}
