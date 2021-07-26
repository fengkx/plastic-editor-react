import { PageEngine } from "@plastic-editor/protocol";
import type { ShallowBlock } from "@plastic-editor/protocol/lib/protocol";
import { useClickOutside, useMountEffect } from "@react-hookz/web";
import clsx from "clsx";
import produce from "immer";
import { useAtom } from "jotai";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import { nanoid } from "nanoid";
import React, { useEffect, useRef, useState } from "react";
import tinykeys from "tinykeys";
import { useKey } from "../../../hooks/useKey";
import {
  deleteBlockAtom,
  ID_LEN,
  newBlockAtom,
  useBlock,
  usePage,
} from "../adapters/memory";
import { anchorOffsetAtom, LINE_HEIGHT_ATOM } from "../store";

const leftBrackets = ["[", "{"];
const rightBracketsMap = { "[": "]", "{": "}" } as const;

const HotKeyWrapper = (fn: () => void) => (event: KeyboardEvent) => {
  event.stopPropagation();
  event.preventDefault();
  fn();
};
export type EditablePropsType = {
  shallowBlock: ShallowBlock;
  path: number[];
  closeEditable: () => void;
  nextBlockId: string;
};
export const EditableBlock: React.FC<EditablePropsType> = ({
  shallowBlock,
  path,
  closeEditable,
}) => {
  const [block, setBlock] = useBlock(shallowBlock.id);
  const [nextBlockId, setNextBlockId] = useState(nanoid(ID_LEN));
  const [page, setPage] = usePage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [anchorOffset, setAnchorOffset] = useAtom(anchorOffsetAtom);
  const addNewBlock = useUpdateAtom(newBlockAtom);
  useKey(
    "Enter",
    (ev) => {
      const textArea = textareaRef.current!;
      if (textArea.selectionStart === 0) {
        addNewBlock({
          newBlockId: nextBlockId,
          pageId: page.id,
          path,
          op: "prepend",
        });
      } else {
        const textAfterCursor = textArea.value.slice(textArea.selectionStart);
        if (shallowBlock.children.length > 0) {
          addNewBlock({
            newBlockId: nextBlockId,
            pageId: page.id,
            path,
            content: textAfterCursor,
            op: "prependChild",
          });
          setBlock(
            produce(block, (draft) => {
              draft.content = textArea.value.slice(0, textArea.selectionStart);
            })
          );
          setAnchorOffset(0);
        } else {
          addNewBlock({
            newBlockId: nextBlockId,
            pageId: page.id,
            path,
            content: textAfterCursor,
            op: "append",
          });
          setBlock(
            produce(block, (draft) => {
              draft.content = textArea.value.slice(0, textArea.selectionStart);
            })
          );
          setAnchorOffset(0);
        }
      }
      // setNextBlockId(nanoid(ID_LEN))
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
  const deleteBlock = useUpdateAtom(deleteBlockAtom);
  useKey(
    "Backspace",
    (ev) => {
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
    },
    {
      target: textareaRef,
      event: "keyup",
      options: { passive: true, capture: true },
    }
  );

  useKey(
    (ev) => leftBrackets.includes(ev.key),
    (ev) => {
      const textArea = ev.target as HTMLTextAreaElement;
      const [start, end] = [textArea.selectionStart, textArea.selectionEnd];
      if (start === end) {
        textArea!.setRangeText(rightBracketsMap[ev.key], start, end);
      } else {
        textArea.setSelectionRange(start, start); // jump to start and left bracket added
        textArea.setRangeText(rightBracketsMap[ev.key], end, end);
        setTimeout(() => textArea.setSelectionRange(start + 1, end + 1), 0);
      }
    },
    { target: textareaRef, event: "keydown", options: { passive: true } }
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
  useClickOutside(textareaRef, () => {
    setAnchorOffset(Infinity);
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
