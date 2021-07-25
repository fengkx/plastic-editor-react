import { useAtom, WritableAtom } from "jotai";
import { Block, ShallowBlock } from "@plastic-editor/protocol/lib/protocol";
import React, { useEffect, useRef, useState } from "react";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import {
  blockFamily,
  deleteBlockAtom,
  IDLEN,
  newBlockAtom,
  pageFamily,
  pageIdAtom,
  useBlock,
  usePage,
} from "../adapters/memory";
import { nanoid } from "nanoid";
import {
  anchorOffsetAtom,
  editingBlockIdAtom,
  LINE_HEIGHT_ATOM,
} from "../store";
import { useKey } from "../../../hooks/useKey";
import { PageEngine } from "@plastic-editor/protocol";
import { useMountEffect, useRerender } from "@react-hookz/web";
import tinykeys from "tinykeys";
import produce from "immer";
import clsx from "clsx";

export type EditablePropsType = {
  blockId: string;
  path: number[];
  closeEditable: () => void;
  nextBlockId: string;
};

const HotKeyWrapper = (fn: () => void) => (event: KeyboardEvent) => {
  event.stopPropagation();
  event.preventDefault();
  fn();
};
export const EditableBlock: React.FC<EditablePropsType> = ({
  blockId,
  path,
  closeEditable,
}) => {
  const [block, setBlock] = useBlock(blockId);
  const [nextBlockId, setNextBlockId] = useState(nanoid(IDLEN));
  const [page, setPage] = usePage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [anchorOffset, setAnchorOffset] = useAtom(anchorOffsetAtom);
  const addNewBlock = useUpdateAtom(newBlockAtom);
  useKey(
    "Enter",
    (ev) => {
      addNewBlock({ newBlockId: nextBlockId, pageId: page.id, path });
    },
    {
      target: textareaRef,
      options: { passive: true, capture: true },
    }
  );
  const shouldDeleteBlockRef = useRef(false);
  useKey(
    "Backspace",
    (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if ((ev.target as HTMLTextAreaElement).value.length === 0) {
        shouldDeleteBlockRef.current = true;
      } else {
        shouldDeleteBlockRef.current = false;
      }
    },
    {
      target: textareaRef,
      event: "keydown",
      options: { passive: true, capture: true },
    }
  );
  const rerender = useRerender();
  const deleteBlock = useUpdateAtom(deleteBlockAtom);
  useKey(
    "Backspace",
    (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      if (
        (ev?.target as HTMLTextAreaElement).value.length === 0 &&
        shouldDeleteBlockRef.current
      ) {
        if (path.length === 1 && path[0] === 0) return;
        deleteBlock({ blockId: block.id, path });
        shouldDeleteBlockRef.current =
          (textareaRef.current as HTMLTextAreaElement)?.value?.length === 0;
      }
      rerender();
    },
    {
      target: textareaRef,
      event: "keyup",
      options: { passive: true, capture: true },
    }
  );
  useMountEffect(() => {
    const textArea = textareaRef.current!;
    setTimeout(() => {
      textArea.focus();
      textArea.selectionEnd = textArea.selectionStart = Math.min(
        block.content.length,
        anchorOffset
      );
      shouldDeleteBlockRef.current = textArea.value.length === 0;
    }, 0);
  });
  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }
    return tinykeys(textareaRef.current, {
      Tab: HotKeyWrapper(() => {
        const pageEngine = new PageEngine(page);
        pageEngine.forward(path);
        setPage(pageEngine.page);
      }),
      "Shift+Tab": HotKeyWrapper(() => {
        if (path.length < 2) return;
        const pageEngine = new PageEngine(page);
        pageEngine.backward(path);
        setPage(pageEngine.page);
      }),
    });
  });
  return (
    <>
      <style jsx>{`
        .editor {
          outline: none;
          border: none;
          resize: none;
        }
      `}</style>
      <textarea
        ref={textareaRef}
        onChange={(ev) => {
          let { value } = ev.target;
          if (value.endsWith("\n")) {
            value = value.substring(0, value.length - 1);
            ev.target.value = value;
          }
          setAnchorOffset(value.length);
          setBlock(
            produce(block, (draft) => {
              draft.content = value;
            })
          );
        }}
        value={block.content}
        className={clsx(
          "editor",
          "block",
          "w-full",
          "m-0",
          "p-0",
          "overflow-hidden"
        )}
        style={{ height: useAtomValue(LINE_HEIGHT_ATOM) }}
      />
    </>
  );
};
