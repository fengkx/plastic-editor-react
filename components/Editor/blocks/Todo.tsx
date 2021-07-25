import produce from "immer";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai/utils";
import React, { useCallback } from "react";
import { blockFamily, pageIdAtom } from "../adapters/memory";

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
