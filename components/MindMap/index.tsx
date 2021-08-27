import React, { useMemo, Suspense, useEffect, useState, useRef } from "react";
import { useRafCallback, useRerender } from "@react-hookz/web";
import { Group } from "@visx/group";
import { Tree, hierarchy } from "@visx/hierarchy";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { LinkHorizontalStep } from "@visx/shape";
import { LinearGradient } from "@visx/gradient";
import { Preview } from "../Block/Preview";
import { withScreenSize } from "@visx/responsive";

const peach = "#fd9b93";
const pink = "#fe6e9e";
const blue = "#03c0dc";
const green = "#26deb0";
const plum = "#71248e";
const lightpurple = "#374469";
const white = "#ffffff";
export const background = "#272b4d";

interface TreeNode {
  id: string;
  title?: string;
  children?: this[];
}

type HierarchyNode = HierarchyPointNode<TreeNode>;

const rawTree: TreeNode = {
  id: "XDBOwomABiDodX2",
  title: "D3 note",
  children: [
    {
      id: "LJoE-cYdpHA7U0z",
      children: [],
    },
    {
      id: "XDBOwomABiDodX2",
      children: [
        {
          id: "APf8DMcG0GlA0iv",
          children: [],
        },
        {
          id: "x4r7zUQJQXSGEY8",
          children: [],
        },
        {
          id: "IshE3JxcPTAs5vb",
          children: [],
        },
        {
          id: "RyIa3LWjrOKDP7R",
          children: [
            {
              id: "mFVkDk2PNhpWmEf",
              children: [],
            },
            {
              id: "9xrvxbb0EvoSQfn",
              children: [],
            },
            {
              id: "ff0kjQI9xIZX3OK",
              children: [],
            },
          ],
        },
        {
          id: "p9FVEagBuxbfh22",
          children: [
            {
              id: "1bhj8V25LqStWbW",
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

/** Handles rendering Root, Parent, and other Nodes. */
function Node({ node }: { node: HierarchyNode }) {
  const width = 40;
  const height = 20;
  const centerX = -width / 2;
  const centerY = -height / 2;
  const isRoot = node.depth === 0;
  const isParent = !!node.children;

  if (isRoot) return <ParentNode node={node} />;
  if (isParent) return <ParentNode node={node} />;

  return (
    <Group top={node.x} left={node.y}>
      <DynamicPreview width={width} height={height} node={node} />
    </Group>
  );
}

function RootNode({ node }: { node: HierarchyNode }) {
  return (
    <Group top={node.x} left={node.y}>
      <circle r={12} fill="url('#lg')" />
      <text
        dy=".33em"
        fontSize={9}
        fontFamily="Arial"
        textAnchor="middle"
        style={{ pointerEvents: "none" }}
        fill={plum}
      >
        {node.data.title ?? node.data.id}
      </text>
    </Group>
  );
}

function DynamicPreview(props: {
  height: number;
  width: number;
  node: HierarchyNode;
}) {
  const { node } = props;
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const ref = useRef<Element>(null);
  useEffect(() => {
    const rect = ref.current?.getBoundingClientRect();
    setHeight(rect?.height ?? props.height);
    setWidth(Math.max(rect?.width ?? props.width, 400));
  });
  return (
    <foreignObject height={height + 4} width={width}>
      <Suspense fallback={"Loading"}>
        <Preview
          ref={ref}
          blockId={node.data.id}
          className="break-words max-w-md"
        />
      </Suspense>
    </foreignObject>
  );
}

function ParentNode({ node }: { node: HierarchyNode }) {
  const width = 40;
  const height = 20;

  return (
    <Group top={node.x} left={node.y}>
      <DynamicPreview width={width} height={height} node={node} />
    </Group>
  );
}

const defaultMargin = { top: 10, left: 80, right: 80, bottom: 10 };

export type TreeProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

export const MindMap = withScreenSize(function MindMap({
  screenWidth: width,
  screenHeight: height,
  margin = defaultMargin,
}: TreeProps) {
  const data = useMemo(() => hierarchy(rawTree), []);
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;
  console.log({ xMax, yMax });
  return width < 10 ? null : (
    <svg width={width} height={height}>
      <LinearGradient id="lg" from={peach} to={pink} />
      <rect width={width} height={height} fill={background} />
      <Tree<TreeNode>
        root={data}
        size={[982, 932]}
        separation={(a, b) => {
          console.log(
            (a.parent == b.parent ? 1 : 2) / a.depth,
            a.data.id,
            b.data.id,
            a.depth
          );
          return (a.parent == b.parent ? 3 : 4) / a.depth;
        }}
      >
        {(tree) => {
          console.log(tree.descendants());
          return (
            <Group top={margin.top} left={margin.left}>
              {tree.links().map((link, i) => (
                <LinkHorizontalStep
                  key={`link-${i}`}
                  data={link}
                  stroke={lightpurple}
                  strokeWidth="1"
                  fill="none"
                  percent={0.8}
                />
              ))}
              {tree.descendants().map((node, i) => (
                <Node key={`node-${i}`} node={node} />
              ))}
            </Group>
          );
        }}
      </Tree>
      {/* <DynamicPreview width={40} height={20} node={{data: {id: "LJoE-cYdpHA7U0z"}}} /> */}
    </svg>
  );
});
