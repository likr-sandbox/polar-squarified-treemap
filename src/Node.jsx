import * as d3 from "d3";

function computeTreemap(words) {
  const root = d3.hierarchy({
    children: words,
  });
  root.sum((node) => node.score);
  root.sort((node1, node2) => {
    return node2.value - node1.value;
  });
  const treemap = d3.treemap();
  return treemap(root).children;
}

function NodeTreemap({ item }) {
  const tiles = computeTreemap(item.data.data.WordScore.slice(0, 10));
  const arc = d3.arc();
  const tileXScale = d3.scaleLinear().domain([0, 1]).range([item.t0, item.t1]);
  const tileYScale = d3
    .scalePow()
    .domain([0, 1])
    .range([item.r0, item.r1])
    .exponent(0.5);
  return (
    <g>
      {tiles.map((tile, i) => {
        const innerRadius = tileYScale(tile.y0);
        const outerRadius = tileYScale(tile.y1);
        const startAngle = tileXScale(tile.x0);
        const endAngle = tileXScale(tile.x1);
        const [cx, cy] = arc.centroid({
          innerRadius,
          outerRadius,
          startAngle,
          endAngle,
        });
        const s =
          ((endAngle - startAngle) * (outerRadius ** 2 - innerRadius ** 2)) / 2;
        const t1 = (Math.atan2(cy, cx) / Math.PI) * 180 - 90;
        const t2 =
          (2 * (outerRadius - innerRadius)) /
            (endAngle - startAngle) /
            (outerRadius + innerRadius) >
          1
            ? 90
            : 0;
        const d = Math.sqrt(cx * cx + cy * cy);
        return (
          <g key={i}>
            <path
              d={arc({
                innerRadius,
                outerRadius,
                startAngle,
                endAngle,
              })}
              fill="none"
              stroke="#ccc"
            />
            {s > 100 && (
              <text
                transform={`rotate(${t1})translate(0,${d})rotate(${t2})`}
                fontSize="6"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {tile.data.word}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

export default function Node({ node: item }) {
  const arc = d3.arc();
  return (
    <g>
      {((item.t1 - item.t0) * (item.r1 ** 2 - item.r0 ** 2)) / 2 > 0 && (
        <NodeTreemap item={item} />
      )}
      <g>
        <path
          d={arc({
            innerRadius: item.r0,
            outerRadius: item.r1,
            startAngle: item.t0,
            endAngle: item.t1,
          })}
          fill="none"
          stroke="#444"
          strokeWidth="3"
        />
      </g>
    </g>
  );
}
