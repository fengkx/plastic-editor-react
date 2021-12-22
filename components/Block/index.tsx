import { Suspense } from "react";
import type { ShallowBlock } from "@plastic-editor/protocol/lib/protocol";
import { useMountEffect, useSafeState } from "@react-hookz/web";
import clsx from "clsx";
import deepEqual from "fast-deep-equal/es6/react";
import { useUpdateAtom } from "jotai/utils";
import { nanoid } from "nanoid";
import { memo as ReactMemo, useRef } from "react";
import { DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import { useAdapter } from "../Editor/adapters/AdapterContext";
import { ID_LEN } from "../Editor/adapters/memory";
import { editingBlockIdAtom } from "../Editor/store";
import { BlockContent } from "./BlockContent";
import { LineDirection } from "./LineDirection";
import { DotFlashing } from "../Loading";
export type PropsType = {
  debugMode?: boolean;
  path: number[];
  shallowBlock: ShallowBlock;
  pageId: string;
  initEditable: boolean;
  initialBlockDetectedEnd?: boolean;
};
const BlockImpl: React.FC<PropsType> = ({
  debugMode = false,
  path,
  shallowBlock,
  pageId,
  initEditable,
}) => {
  const setEditingBlockId = useUpdateAtom(editingBlockIdAtom);
  useMountEffect(() => {
    if (initEditable) {
      setEditingBlockId(shallowBlock.id);
    }
  });

  const [dropMoveDirection, setDropMoveDirection] = useSafeState<
    false | "up" | "down"
  >(false);
  const blockRootRef = useRef<HTMLDivElement>(null);
  const { moveBlockAtom } = useAdapter();
  const moveBlock = useUpdateAtom(moveBlockAtom);
  const [, drag, dragPreview] = useDrag({
    type: "BLOCK",
    item: { path },
  });
  const [{ isOver }, drop] = useDrop({
    accept: "BLOCK",
    collect: (monitor) => {
      const isOver = monitor.isOver();
      return { isOver };
    },
    hover(item: { path: number[] }, monitor: DropTargetMonitor) {
      if (!blockRootRef.current) {
        return;
      }
      const dragPath = item.path;
      if (deepEqual(path, dragPath)) return;

      const hoverBoundingRect = blockRootRef.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      const commonLen = Math.min(path.length, dragPath.length);
      if (
        dragPath.length < path.length &&
        deepEqual(dragPath.slice(0, commonLen), path.slice(0, commonLen))
      ) {
        return; // parent can't move to its own children
      }
      let isDragDown = false;
      for (let i = 0; i < commonLen; i++) {
        if (path[i] === dragPath[i]) continue;
        if (dragPath[i] > path[i]) isDragDown = false;
        else {
          isDragDown = true;
        }
      }

      // if (isDragDown && hoverClientY < hoverMiddleY) return;
      // if (!isDragDown && hoverClientY > hoverMiddleY) return;
      setDropMoveDirection(hoverClientY <= hoverMiddleY ? "up" : "down");
    },
    drop(item) {
      const dragPath = item.path;
      if (dropMoveDirection && isOver) {
        if (dropMoveDirection === "down") {
          path[path.length - 1] += 1;
        }
        moveBlock({ from: dragPath, to: path });
        setDropMoveDirection(false);
      }
    },
  });
  const className = clsx("flex", `block-${path.join("-")}`, "relative", "mb-2");
  drop(dragPreview(blockRootRef));
  return (
    <>
      <div id={shallowBlock.id} className={className} ref={blockRootRef}>
        <LineDirection dragRef={drag} />
        <Suspense fallback={<DotFlashing />}>
          <BlockContent
            className={clsx({
              "drop-over": isOver,
              up: dropMoveDirection === "up",
              down: dropMoveDirection === "down",
            })}
            path={path}
            pageId={pageId}
            shallowBlock={shallowBlock}
            nextBlockId={nanoid(ID_LEN)}
          />
        </Suspense>
      </div>
      {shallowBlock.children.length > 0 && (
        <BlockChildren
          shallowBlock={shallowBlock}
          path={path}
          pageId={pageId}
        />
      )}
    </>
  );
};

function BlockChildren({
  shallowBlock,
  path,
  pageId,
}: {
  shallowBlock: ShallowBlock;
  path: number[];
  pageId: string;
}) {
  return (
    <div className={"children flex ml-4"}>
      <div
        className="self-stretch bg-gray-300"
        style={{
          width: 1,
          maxWidth: 1,
          marginLeft: 1,
        }}
      />
      <div className="flex-1 max-w-full">
        {shallowBlock.children.map((shallow, idx) => {
          return (
            <Block
              key={shallow.id}
              path={[...path, idx]}
              shallowBlock={shallow}
              pageId={pageId}
              initEditable={false}
            />
          );
        })}
      </div>
    </div>
  );
}

export const Block = ReactMemo(BlockImpl, (prevProps, nextProps) =>
  deepEqual(prevProps, nextProps)
);
