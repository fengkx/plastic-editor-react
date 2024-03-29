import type { ShallowBlock } from "@plastic-editor/protocol/lib/protocol";
import { useAtomValue } from "jotai";
import { EditableBlock } from "../Editor/blocks/Editable";
import { editingBlockIdAtom } from "../Editor/store";
import { Preview } from "./Preview";

export type PropsType = {
  className: string;
  shallowBlock: ShallowBlock;
  pageId: string;
  path: number[];
  nextBlockId: string;
};
export const BlockContent: React.FC<PropsType> = ({
  className,
  shallowBlock,
  path,
  nextBlockId,
}) => {
  const editingBlockId = useAtomValue(editingBlockIdAtom);
  const isEditing = editingBlockId === shallowBlock.id;

  if (!isEditing) {
    return <Preview className={className} blockId={shallowBlock.id} />;
  }

  return (
    <EditableBlock
      className={className}
      path={path}
      shallowBlock={shallowBlock}
      nextBlockId={nextBlockId}
    />
  );
};
