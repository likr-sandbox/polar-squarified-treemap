import { Suspense, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Node from "./Node";
import * as d3 from "d3";

function normalizeDistance(root) {
  const scale = d3
    .scaleLinear()
    .domain(d3.extent(root.descendants(), (item) => item.data.data.distance))
    .range([500, 0]);
  for (const node of root) {
    node.distance = scale(node.data.data.distance);
  }
}

function visit(node, dt, parent) {
  const mergeThreshold = 50;
  if (node.children) {
    node.t1 = node.t0;
    if (node.distance - parent.distance > mergeThreshold) {
      node.r1 = node.distance;
    } else {
      node.r1 = node.r0;
    }
    for (const child of node.children) {
      child.t0 = node.t1;
      child.r0 = node.r1;
      if (node.distance - parent.distance > mergeThreshold) {
        visit(child, dt, node);
      } else {
        visit(child, dt, parent);
      }
      node.t1 = child.t1;
    }
  } else {
    node.t1 = node.t0 + dt;
    node.r1 = node.distance;
  }
}

function layout(data) {
  const stratify = d3
    .stratify()
    .id((item) => item.no)
    .parentId((item) => item.parent);
  const dataStratify = stratify(data);
  const root = d3.hierarchy(dataStratify);
  normalizeDistance(root);
  for (const node of root) {
    node.data.data.WordScore.sort((item1, item2) => item2.score - item1.score);
  }
  // aggregateWords(root);
  // root.data.data.WordScore = root.data.data.TopicScore;
  root.t0 = 0;
  root.r0 = 0;
  const dt = (2 * Math.PI) / root.leaves().length;
  visit(root, dt, root);
  return root.descendants();
}

function DendrogramContent({ drawing }) {
  const radius = 500;
  const margin = 10;
  const width = (radius + margin) * 2;
  const height = width;

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <g transform={`translate(${width / 2},${height / 2})`}>
        {drawing.map((item, i) => {
          return <Node key={i} node={item} />;
        })}
      </g>
    </svg>
  );
}

function Dendrogram() {
  const { data } = useQuery({
    queryKey: ["data"],
    queryFn: async () => {
      const response = await fetch("data/visdata221109v2.json");
      return response.json();
    },
  });
  const drawing = useMemo(() => {
    return layout(data);
  }, [data]);
  return (
    <div>
      <DendrogramContent drawing={drawing} />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<p>loading</p>}>
      <Dendrogram />
    </Suspense>
  );
}
