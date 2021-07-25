import type { ShallowBlock } from "@plastic-editor/protocol/lib/protocol";
import { useMountEffect } from "@react-hookz/web";
import clsx from "clsx";
import deepEqual from "fast-deep-equal/es6/react";
import { useUpdateAtom } from "jotai/utils";
import { nanoid } from "nanoid";
import React from "react";
import { IDLEN } from "../Editor/adapters/memory";
import { editingBlockIdAtom } from "../Editor/store";
import { BlockContent } from "./BlockContent";
import { LineDirection } from "./LineDirection";
export type PropsType = {
  debugMode?: boolean;
  path: number[];
  shllowBlock: ShallowBlock;
  pageId: string;
  initEditable: boolean;
  initialBlockId: string;
  initialBlockDetectedEnd?: boolean;
};
const BlockImpl: React.FC<PropsType> = ({
  debugMode = false,
  path,
  shllowBlock,
  pageId,
  initEditable,
}) => {
  const setEditingBlockId = useUpdateAtom(editingBlockIdAtom);
  useMountEffect(() => {
    if (initEditable) {
      setEditingBlockId(shllowBlock.id);
    }
  });

  const className = clsx("flex", `block-${path.join("-")}`, "relative", "mb-2");
  return (
    <>
      <div id={shllowBlock.id} className={className}>
        <LineDirection />
        <BlockContent
          path={path}
          blockId={shllowBlock.id}
          pageId={pageId}
          nextBlockId={nanoid(IDLEN)}
        />
      </div>
      <div className={"children flex ml-4"}>
        <div
          className="self-stretch bg-gray-300"
          style={{ width: 1, marginLeft: 2 }}
        />
        <div className="flex-1 max-w-full">
          {shllowBlock.children.map((shallow, idx) => {
            return (
              <Block
                key={shallow.id}
                path={[...path, idx]}
                shllowBlock={shallow}
                pageId={pageId}
                initEditable={false}
                initialBlockId={nanoid(8)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export const Block = React.memo(BlockImpl, (prevProps, nextProps) =>
  deepEqual(prevProps, nextProps)
);
