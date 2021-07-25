import { useAtomValue } from "jotai/utils";
import React from "react";
import { blockFamily } from "../Editor/adapters/memory";
import { EditableBlock } from "../Editor/blocks/Editable";
import { editingBlockIdAtom } from "../Editor/store";
import { Preview } from "./Preview";

export type PropsType = {
  blockId: string;
  pageId: string;
  path: number[];
  nextBlockId: string;
};
export const BlockContent: React.FC<PropsType> = ({
  blockId,
  pageId,
  path,
  nextBlockId,
}) => {
  const editingBlockId = useAtomValue(editingBlockIdAtom);
  const isEditing = editingBlockId === blockId;
  const blockAtom = blockFamily({ id: blockId, pageId });

  if (!isEditing) {
    return <Preview blockId={blockId} />;
  }

  return (
    <EditableBlock
      path={path}
      blockId={blockId}
      nextBlockId={nextBlockId}
      closeEditable={() => {}}
    />
  );
};
