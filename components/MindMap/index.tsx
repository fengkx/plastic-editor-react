import React, { useMemo, Suspense, useEffect, useState, useRef } from "react";
import { Group } from "@visx/group";
import { Tree, Cluster, Pack, hierarchy } from "@visx/hierarchy";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { LinkHorizontalStep, LinkHorizontal } from "@visx/shape";
import { Preview } from "../Block/Preview";
import { ParentSize } from "@visx/responsive";
import { Zoom } from "@visx/zoom";

const peach = "#fd9b93";
const pink = "#fe6e9e";
const blue = "#03c0dc";
const green = "#26deb0";
const plum = "#71248e";
const lightpurple = "#374469";
const white = "#ffffff";
export const background = "#272b4d";

export interface TreeNode {
  id: string;
  title?: string;
  children?: this[];
}

type HierarchyNode = HierarchyPointNode<TreeNode>;

/** Handles rendering Root, Parent, and other Nodes. */
function Node({ node }: { node: HierarchyNode }) {
  const width = 5000;
  const height = 5000;

  return (
    <Group top={node.x} left={node.y}>
      <DynamicPreview width={width} height={height} node={node} />
    </Group>
  );
}

function DynamicPreview(props: {
  height: number;
  width: number;
  node: HierarchyNode;
}) {
  const { node } = props;
  const [height, setHeight] = useState(props.height);
  const [width, setWidth] = useState(props.width);

  const ref = useRef<HTMLElement | HTMLImageElement>(null);
  const syncSize = () => {
    const rect = ref.current?.getBoundingClientRect();
    const img = ref.current?.querySelector("img");
    if (img) {
      img.addEventListener("load", (ev) => {
        setHeight(Math.min(img.height, 320));
        setWidth(Math.min(img.width, 320));
        setTimeout(() => {
          const rect = ref.current!.getBoundingClientRect();
          setHeight(rect.height);
          setWidth(rect.width);
        }, 0);
      });
    } else {
      setHeight(Math.min(rect?.height ?? props.height, 320));
      setWidth(Math.max(Math.min(rect?.width ?? props.width, 320), 120));
    }
  };
  useEffect(() => {
    syncSize();
  }, [width, height, ref.current]);

  const translate = useMemo(() => {
    if (ref.current?.tagName === "IMG") {
      return "";
    }
    return `translate(8, ${height * (node.children ? 0.25 : -0.95)})`;
  }, [height, ref.current, node.children, node]);
  return (
    <foreignObject height={height + 4} width={width} transform={translate}>
      <Suspense fallback={"Loading"}>
        <Preview
          ref={ref}
          blockId={node.data.id}
          className="inline-block break-words max-w-md bg-gray-100 p-2 shadow-md border border-gray-200"
        />
      </Suspense>
    </foreignObject>
  );
}

const defaultMargin = { top: 48, left: 80, right: 80, bottom: 16 };

export type TreeProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  rawTree: TreeNode;
};

function MindMapTree({
  width,
  height,
  margin = defaultMargin,
  rawTree,
}: TreeProps) {
  const data = useMemo(() => hierarchy(rawTree), []);
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;
  const scale = 1;
  return width < 10 ? null : (
    <Zoom<SVGSVGElement>
      width={width}
      height={height}
      scaleXMin={0.5 / scale}
      scaleYMin={0.5 / scale}
    >
      {(zoom) => (
        <div className="relative">
          <svg
            width={width}
            height={height}
            ref={zoom.containerRef}
            style={{
              cursor: zoom.isDragging ? "grabbing" : "grab",
              touchAction: "none",
            }}
          >
            <rect fill={"#fcfcfc"} width={width} height={height} />
            <Tree<TreeNode>
              root={data}
              size={[yMax * scale, xMax * scale]}
              separation={(a, b) => {
                return (a.parent == b.parent ? 0.2 : 0.1) * a.depth;
              }}
            >
              {(tree) => {
                return (
                  <Group transform={zoom.toString()}>
                    {tree.links().map((link, i) => (
                      <LinkHorizontalStep
                        key={`link-${i}`}
                        data={link}
                        stroke={"#333"}
                        strokeWidth="2"
                        fill="none"
                        percent={0.9}
                      />
                    ))}
                    {tree.descendants().map((node, i) => (
                      <Node key={`node-${i}`} node={node} />
                    ))}
                  </Group>
                );
              }}
            </Tree>
          </svg>
        </div>
      )}
    </Zoom>
  );
}

export const MindMap: React.FC<{ tree: TreeNode }> = ({ tree }) => {
  return (
    <ParentSize>
      {(parent) => (
        <MindMapTree
          width={parent.width}
          rawTree={tree}
          height={parent.height}
        />
      )}
    </ParentSize>
  );
};
