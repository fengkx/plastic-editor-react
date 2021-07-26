import { PageEngine } from "@plastic-editor/protocol";
import type {
  Block,
  Page,
  ShallowBlock,
} from "@plastic-editor/protocol/lib/protocol";
import { format } from "date-fns";
import FileSaver from "file-saver";
import produce from "immer";
import { atom, useAtom } from "jotai";
import {
  atomFamily,
  atomWithDefault,
  atomWithStorage,
  useAtomValue,
} from "jotai/utils";
import { nanoid } from "nanoid";
import { anchorOffsetAtom, editingBlockIdAtom } from "../store";
import { Note } from "./types";

export const ID_LEN = 15;

export const isStaleAtom = atom(false);

type PartialPick<T, K extends keyof T> = {
  [P in K]?: T[P];
};

const defaultPageIdFromRoute = () => {
  if (process.browser) {
    const matches = window?.location?.pathname?.match(
      /\/note\/([^\/]+)?\/?/
    ) ?? [""];
    return matches![1] as string;
  } else {
    return "";
  }
};
export const pageIdAtom = atomWithDefault(defaultPageIdFromRoute);
const pagesAtom = atomWithStorage<Record<string, Page>>("plastic@pages", {});
const pageDefault = (id: string): Page => ({
  id,
  type: "default" as const,
  title: `${format(new Date(), "MMMM, dd, yyyy")}`,
  children: [],
});

export const pageFamily = atomFamily<
  Pick<Page, "id"> & PartialPick<Page, "children" | "title">,
  Page,
  Page
>(
  ({ id, children, title }) =>
    atom(
      (get) => {
        const cache = get(pagesAtom);
        const cachedValue = cache[id];
        if (cachedValue) {
          return cachedValue;
        }
        const defaultValue = pageDefault(id);
        if (!children) {
          const blockId = nanoid(ID_LEN);
          const block = get(blockFamily({ id: blockId, pageId: id }));
          const shallow: ShallowBlock = { id: block.id, children: [] };
          defaultValue.children = [shallow];
        }
        return defaultValue;
      },
      (get, set, update) => {
        const prev = get(pagesAtom);
        const newPage = produce(prev, (draft) => {
          draft[id] = {
            ...prev[id],
            ...update,
          };
        });
        set(pagesAtom, newPage);
        set(isStaleAtom, true);
      }
    ),
  (a, b) => a.id === b.id
);

const blockDefault = (id: string, pageId: string): Block => ({
  id,
  pageId,
  content: "",
  references: [],
});
const blocksAtom = atomWithStorage<Record<string, Block>>("plastic@blocks", {});
export const blockFamily = atomFamily<
  Pick<Block, "id" | "pageId"> & PartialPick<Block, "content">,
  Block,
  Block
>(
  ({ id, pageId, content }) =>
    atom(
      (get) => {
        const cache = get(blocksAtom);
        const cachedValue = cache[id];
        if (cachedValue) return cachedValue;
        const defaultValue = blockDefault(id, pageId);
        if (content) defaultValue.content = content;
        return defaultValue;
      },
      (get, set, update) => {
        const prev = get(blocksAtom);
        const newBlock = produce(prev, (draft) => {
          draft[id] = {
            ...prev[id],
            ...update,
          };
        });
        set(blocksAtom, newBlock);
        set(isStaleAtom, true);
      }
    ),
  (a, b) => a.id === b.id && a.pageId === b.pageId
);

export const starsAtom = atomWithStorage<string[]>("plastic@stars", []);
export const deleteBlockAtom = atom<null, { path: number[]; blockId: string }>(
  null,
  (get, set, update) => {
    const { path, blockId } = update;
    const blocks = get(blocksAtom);
    const pages = get(pagesAtom);
    const page = get(pageFamily({ id: get(pageIdAtom) }));
    const pageEngine = new PageEngine(page);
    const [closest, closetPos] = pageEngine.upClosest(path);
    pageEngine.remove(path);
    set(anchorOffsetAtom, Infinity);
    set(editingBlockIdAtom, closest.id);
    set(
      pagesAtom,
      produce(pages, (draft) => {
        draft[page.id] = pageEngine.page;
      })
    );
    set(
      blocksAtom,
      produce(blocks, (draft) => {
        delete draft[blockId];
      })
    );
  }
);

export const newBlockAtom = atom<
  null,
  {
    newBlockId: string;
    pageId: string;
    path: number[];
    content?: string;
    op: "append" | "prepend" | "prependChild";
  }
>(null, (get, set, update) => {
  const { newBlockId, pageId, path, content } = update;
  const newBlockAtom = blockFamily({ id: newBlockId, pageId, content });
  const shallow: ShallowBlock = { id: newBlockId, children: [] };
  const pageAtom = pageFamily({ id: pageId });
  const pageEngine = new PageEngine(get(pageAtom));
  switch (update.op) {
    case "append":
      pageEngine.apendBlockAt(path, shallow);
      break;
    case "prepend":
      pageEngine.prependBlockAt(path, shallow);
      break;
    case "prependChild":
      pageEngine.prependChild(path, shallow);
  }
  set(pageAtom, pageEngine.page);
  set(editingBlockIdAtom, newBlockId);
  if (content) {
    set(newBlockAtom, get(newBlockAtom));
  }
});

export const pageValuesAtom = atom((get) => {
  return Object.values(get(pagesAtom));
});

export const saveNotesAtom = atom(null, (get) => {
  const pages = Object.values(get(pagesAtom));
  const blocks = get(blocksAtom);
  const stars = get(starsAtom);
  const note: Note = {
    pages,
    blocks,
    stars,
  };
  const jsonStr = JSON.stringify(note);
  const blob = new Blob([jsonStr], { type: "text/plain;charset=utf-8" });
  FileSaver.saveAs(blob, "note.json");
});

export const loadNotesAtom = atom<null, Note>(null, (get, set, update) => {
  set(
    pagesAtom,
    update.pages.reduce((acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    }, {})
  );
  set(blocksAtom, update.blocks);
  set(starsAtom, update.stars);
});

export const usePage = () => {
  return useAtom(pageFamily({ id: useAtomValue(pageIdAtom) }));
};
export const useBlock = (id: string) => {
  const pageId = useAtomValue(pageIdAtom);
  return useAtom(blockFamily({ id, pageId }));
};
