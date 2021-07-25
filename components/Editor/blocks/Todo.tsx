import React, { useCallback } from "react";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import { blockFamily, pageIdAtom } from "../adapters/memory";
import { useAtom } from "jotai";
import produce from "immer";
import { useRerender } from "@react-hookz/web";

export const Todo: React.FC<{
  checked: boolean;
  blockId: string;
}> = ({ checked, blockId }) => {
  const pageId = useAtomValue(pageIdAtom);
  const [block, setBlock] = useAtom(blockFamily({ id: blockId, pageId }));
  const toggle = useCallback(
    (ev) => {
      ev.stopPropagation();
      if (checked) {
        setBlock(
          produce(block, (draft) => {
            draft.content = draft.content.replace("{{{DONE}}}", "{{{TODO}}}");
          })
        );
      } else {
        setBlock(
          produce(block, (draft) => {
            draft.content = draft.content.replace("{{{TODO}}}", "{{{DONE}}}");
          })
        );
      }
    },
    [checked, block, setBlock]
  );
  return (
    <input
      checked={checked}
      onClick={toggle}
      onChange={() => {}}
      type="checkbox"
    />
  );
};
