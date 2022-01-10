import { Block } from "@plastic-editor/protocol/lib/protocol";
import clsx from "clsx";
import deepEqual from "fast-deep-equal/es6/react";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import { nanoid } from "nanoid";
import {
  memo as ReactMemo,
  useCallback,
  forwardRef,
  CSSProperties,
  RefObject,
} from "react";
import { useAdapter } from "../Editor/adapters/AdapterContext";
import { Token, tokenizer } from "../Editor/parser";
import { anchorOffsetAtom, editingBlockIdAtom } from "../Editor/store";

export type PropsType = {
  blockId: string;
  className: string;
  style?: CSSProperties;
};
const PreviewImpl: React.ForwardRefRenderFunction<HTMLElement, PropsType> = (
  { blockId, className, style },
  ref
) => {
  const { blockFamily, pageIdAtom } = useAdapter();
  const setAnchorOffset = useUpdateAtom(anchorOffsetAtom);
  const setEditingBlockId = useUpdateAtom(editingBlockIdAtom);
  const focusCallback = useCallback(
    (ev) => {
      ev.stopPropagation();
      setEditingBlockId(blockId);
    },
    [blockId, setEditingBlockId]
  );
  const block = useAtomValue<Block>(
    blockFamily({ id: blockId, pageId: useAtomValue(pageIdAtom) })
  );
  const focusTextHelper =
    (token: Token) =>
    (offset: number = 0) =>
    (ev) => {
      const selection = window.getSelection();
      setAnchorOffset((selection?.anchorOffset ?? 0) + token.position + offset);
    };
  const parsed = tokenizer(block.content, []);
  return (
    <>
      <style jsx>{`
        .drop-over.up {
          box-shadow: 0px -5px 0px hsl(0, 0%, 90%);
        }
        .drop-over.down {
          box-shadow: 0px 5px 0px hsl(0, 0%, 90%);
        }
      `}</style>
      <div
        className={clsx("preview flex-1 cursor-text", className)}
        onClick={focusCallback}
        ref={ref as RefObject<HTMLDivElement>}
        style={style}
      >
        {parsed.map((token) => {
          return (
            <token.meta.component
              key={nanoid(4)}
              {...token.meta.props}
              blockId={blockId}
              focusTextHelper={focusTextHelper(token)}
            />
          );
        })}
      </div>
    </>
  );
};

export const Preview = ReactMemo(
  forwardRef(PreviewImpl),
  (prevProps, nextProps) => deepEqual(prevProps, nextProps)
);
