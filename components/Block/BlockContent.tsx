import type { ShallowBlock } from "@plastic-editor/protocol/lib/protocol";
import { useAtomValue } from "jotai/utils";
import React from "react";
import { EditableBlock } from "../Editor/blocks/Editable";
import { editingBlockIdAtom } from "../Editor/store";
import { Preview } from "./Preview";

export type PropsType = {
  shallowBlock: ShallowBlock;
  pageId: string;
  path: number[];
  nextBlockId: string;
};
export const BlockContent: React.FC<PropsType> = ({
  shallowBlock,
  path,
  nextBlockId,
}) => {
  const editingBlockId = useAtomValue(editingBlockIdAtom);
  const isEditing = editingBlockId === shallowBlock.id;

  if (!isEditing) {
    return <Preview blockId={shallowBlock.id} />;
  }

  return (
    <EditableBlock
      path={path}
      shallowBlock={shallowBlock}
      nextBlockId={nextBlockId}
      closeEditable={() => {}}
    />
  );
};
