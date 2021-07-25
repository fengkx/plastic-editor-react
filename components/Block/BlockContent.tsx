import clsx from "clsx";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { blockFamily } from "../Editor/adapters/memory";
import { useAtomValue } from "jotai/utils";
import { useAtom } from "jotai";
import { editingBlockIdAtom } from "../Editor/store";
import { EditableBlock } from "../Editor/blocks/Editable";
import { Preview } from "./Preview";
import deepEqual from "fast-deep-equal/es6/react";

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
