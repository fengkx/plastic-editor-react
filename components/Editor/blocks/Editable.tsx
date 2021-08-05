import { PageEngine } from "@plastic-editor/protocol";
import type { ShallowBlock } from "@plastic-editor/protocol/lib/protocol";
import {
  useClickOutside,
  useEventListener,
  useKeyboardEvent,
  useMountEffect,
} from "@react-hookz/web";
import clsx from "clsx";
import produce from "immer";
import { useAtom } from "jotai";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import React, { useEffect, useRef } from "react";
import tinykeys from "tinykeys";
import { useNanoid } from "../../../hooks/useNanoid";
import { useAdapter } from "../adapters/AdapterContext";
import {
  anchorOffsetAtom,
  editingBlockIdAtom,
  LINE_HEIGHT_ATOM,
} from "../store";

const leftBrackets = ["[", "{"];
const rightBracketsMap = { "[": "]", "{": "}" } as const;

const HotKeyWrapper =
  (fn: (ev: KeyboardEvent) => void) => (event: KeyboardEvent) => {
    event.stopPropagation();
    event.preventDefault();
    fn(event);
  };
export type EditablePropsType = {
  shallowBlock: ShallowBlock;
  path: number[];
  nextBlockId: string;
  className: string;
};
export const EditableBlock: React.FC<EditablePropsType> = ({
  className,
  shallowBlock,
  path,
}) => {
  const { deleteBlockAtom, newBlockAtom, useBlock, usePage } = useAdapter();
  const [block, setBlock] = useBlock(shallowBlock.id);
  const [nextBlockId, genNewBlockId] = useNanoid();
  const [page, setPage] = usePage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [anchorOffset, setAnchorOffset] = useAtom(anchorOffsetAtom);
  const addNewBlock = useUpdateAtom(newBlockAtom);
  const setEditingBlockId = useUpdateAtom(editingBlockIdAtom);
  const shouldCreateNewBlockRef = useRef<boolean>(true);
  useEventListener(textareaRef, "compositionstart", () => {
    shouldCreateNewBlockRef.current = false;
  });
  useEventListener(textareaRef, "compositionend", () => {
    shouldCreateNewBlockRef.current = true;
  });
  useKeyboardEvent(
    "Enter",
    (ev) => {
      if (!shouldCreateNewBlockRef.current) return;
      const textArea = textareaRef.current!;
      if (textArea.selectionStart === 0 && textArea.value.length > 0) {
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
      genNewBlockId();
    },
    undefined,
    {
      target: textareaRef,
      eventOptions: { passive: true, capture: true },
    }
  );
  const shouldDeleteBlockRef = useRef(false);
  useKeyboardEvent(
    "Backspace",
    (ev) => {
      ev.stopPropagation();
      if ((ev.target as HTMLTextAreaElement).value.length === 0) {
        shouldDeleteBlockRef.current = true;
      } else {
        shouldDeleteBlockRef.current = false;
      }
    },
    undefined,
    {
      target: textareaRef,
      event: "keydown",
      eventOptions: { passive: true, capture: true },
    }
  );
  const deleteBlock = useUpdateAtom(deleteBlockAtom);
  useKeyboardEvent(
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
    undefined,
    {
      target: textareaRef,
      event: "keyup",
      eventOptions: { passive: true, capture: true },
    }
  );

  useKeyboardEvent(
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
    undefined,
    { target: textareaRef, event: "keydown", eventOptions: { passive: true } }
  );
  useKeyboardEvent(
    "ArrowUp",
    (ev) => {
      const textArea = ev.target as HTMLTextAreaElement;
      if (
        textArea.selectionStart === textArea.selectionEnd &&
        textArea.selectionStart === 0
      ) {
        const pageEngine = new PageEngine(page);
        const [closest] = pageEngine.upClosest(path);
        setEditingBlockId(closest.id);
        setAnchorOffset(Infinity);
      }
    },
    undefined,
    { target: textareaRef }
  );
  useKeyboardEvent(
    "ArrowDown",
    (ev) => {
      const textArea = ev.target as HTMLTextAreaElement;
      if (
        textArea.selectionStart === textArea.value.length &&
        textArea.selectionEnd === textArea.selectionStart
      ) {
        const { children } = shallowBlock;
        if (children.length > 0) {
          setEditingBlockId(children[0].id);
        } else {
          const pageEngine = new PageEngine(page);
          let [parent, parentPath] = pageEngine.accessParent(path);
          while (parentPath.length >= 0) {
            const lastLevelIdx = path[path.length - 1];
            if (parent.children.length - 1 >= lastLevelIdx + 1) {
              setEditingBlockId(parent.children[lastLevelIdx + 1].id);
              break;
            } else if (parentPath.length === 0) {
              break;
            } else {
              [parent, parentPath] = pageEngine.accessParent(parentPath);
            }
          }
        }
        setAnchorOffset(Infinity);
      }
    },
    undefined,
    { target: textareaRef }
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
        .drop-over.up {
          box-shadow: 0px -5px 0px hsl(0, 0%, 90%);
        }
        .drop-over.down {
          box-shadow: 0px 5px 0px hsl(0, 0%, 90%);
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
          "overflow-hidden",
          className
        )}
        style={{ height: useAtomValue(LINE_HEIGHT_ATOM) }}
      />
    </>
  );
};
