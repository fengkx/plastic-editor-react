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
import { atomFamily, atomWithDefault, useAtomValue } from "jotai/utils";
import { nanoid } from "nanoid";
import { NextRouter } from "next/router";
import {
  atomWithDebouncedStorage,
  createJSONStorage,
  Storage,
} from "../../../atom-util/atomWithDebouncedStorage";
import { anchorOffsetAtom, editingBlockIdAtom } from "../store";
import { Note, PartialPick } from "./types";

export const ID_LEN = 15;
const DEBOUNCE_WAIT = 500;
const DEBOUNCE_MAX_WAIT = 2000;
export const storage = createJSONStorage(() => localStorage);

const isStaleAtom = atom(false);

const defaultPageIdFromRoute = () => {
  if (process.browser) {
    const matches = window?.location?.pathname?.match(
      /\/(?:note|graph)\/([^\/]+)?\/?/
    ) ?? [""];
    return matches![1] as string;
  }
  return "";
};

const pageIdAtom = atomWithDefault(defaultPageIdFromRoute);
export const pagesKey = "plastic@pages";
const pagesAtom = atomWithDebouncedStorage<Record<string, Page>>(
  pagesKey,
  {},
  isStaleAtom,
  DEBOUNCE_WAIT,
  { maxWait: DEBOUNCE_MAX_WAIT },
  storage as Storage<Record<string, Page>>
);
export const pageDefault = (id: string): Page => ({
  id,
  type: "default" as const,
  title: `${format(new Date(), "MMMM, dd, yyyy")}`,
  children: [],
});

const pageFamily = atomFamily<
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
        if (title) {
          defaultValue.title = title;
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

export const blockDefault = (id: string, pageId: string): Block => ({
  id,
  pageId,
  content: "",
  references: [],
});

export const blocksKey = "plastic@blocks";
const blocksAtom = atomWithDebouncedStorage<Record<string, Block>>(
  blocksKey,
  {},
  isStaleAtom,
  DEBOUNCE_WAIT,
  { maxWait: DEBOUNCE_MAX_WAIT },
  storage as Storage<Record<string, Block>>
);
const blockFamily = atomFamily<
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

export const starsKey = "plastic@stars";
const starsAtom = atomWithDebouncedStorage<string[]>(
  starsKey,
  [],
  isStaleAtom,
  DEBOUNCE_WAIT,
  { maxWait: DEBOUNCE_MAX_WAIT },
  storage as Storage<string[]>
);
const deleteBlockAtom = atom<null, { path: number[]; blockId: string }>(
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

const newBlockAtom = atom<
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

const newPageAtom = atom<
  null,
  {
    newPageId: string;
    title: string;
    children?: ShallowBlock[];
    goto?: boolean;
  }
>(null, (get, set, update) => {
  const { newPageId, title, children, goto } = update;
  const newPageAtom = pageFamily({ id: newPageId, title, children });
  set(newPageAtom, get(newPageAtom));
  if (goto) {
    set(pageIdAtom, newPageId);
  }
});

const moveBlockAtom = atom<null, { from: number[]; to: number[] }>(
  null,
  (get, set, update) => {
    const { from, to } = update;
    console.debug(update);
    const pageId = get(pageIdAtom);
    const page = get(pageFamily({ id: pageId }));
    const pageEngine = new PageEngine(page);
    console.debug(pageEngine.page);
    const shallowBlock = pageEngine.access(from);
    const [toParent] = pageEngine.accessParent(to);
    pageEngine.remove(from);
    toParent.children.splice(to[to.length - 1], 0, shallowBlock);
    set(pageFamily({ id: pageId }), pageEngine.page);
    console.debug(pageEngine.page);
  }
);

const pageValuesAtom = atom<(Partial<Page> & Pick<Page, "title" | "id">)[]>(
  (get) => {
    return Object.values(get(pagesAtom));
  }
);

const saveNotesAtom = atom(null, (get) => {
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

const loadNotesAtom = atom<null, Note>(null, (get, set, update) => {
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

const usePage = () => {
  return useAtom(pageFamily({ id: useAtomValue(pageIdAtom) }));
};
const useBlock = (id: string) => {
  const pageId = useAtomValue(pageIdAtom);
  return useAtom(blockFamily({ id, pageId }));
};

export type todayPageUpdate =
  | {
      router: NextRouter;
      id: string;
      path: string;
      today: false;
      replace?: boolean;
    }
  | { router: NextRouter; today: true; replace?: boolean };
const gotoPageAtom = atom<null, todayPageUpdate>(null, (get, set, update) => {
  let path: string, id: string;
  if (update.today) {
    const title = format(new Date(), "MMMM, dd, yyyy");
    const pages = get(pageValuesAtom);
    id = pages.find((p) => p.title === title)?.id ?? nanoid(ID_LEN);
    path = `/note/${id}`;
  } else {
    id = update.id;
    path = update.path;
  }
  const { router } = update;
  if (router) {
    if (update.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
    set(pageIdAtom, id);
  }
});

export const memoryAdapter = {
  $$type: "memory" as "memory" | "supabase",
  pageFamily,
  pageIdAtom,
  pagesAtom,
  blockFamily,
  blocksAtom,
  moveBlockAtom,
  deleteBlockAtom,
  newBlockAtom,
  newPageAtom,
  usePage,
  useBlock,
  saveNotesAtom,
  loadNotesAtom,
  starsAtom,
  gotoPageAtom,
  isStaleAtom,
  pageValuesAtom,
} as const;
