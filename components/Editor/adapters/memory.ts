import { PageEngine } from "@plastic-editor/protocol";
import {
  Block,
  Page,
  ShallowBlock,
} from "@plastic-editor/protocol/lib/protocol";
import { format } from "date-fns";
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

export const IDLEN = 8;

export const isStealAtom = atom(false);

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
  title: `${format(new Date(), "MMMM, dd, yyyy")} Note`,
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
          const blockId = nanoid(IDLEN);
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
        set(isStealAtom, true);
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
  Pick<Block, "id" | "pageId">,
  Block,
  Block
>(
  ({ id, pageId }) =>
    atom(
      (get) => {
        const cache = get(blocksAtom);
        const cachedValue = cache[id];
        if (cachedValue) return cachedValue;
        const defaultValue = blockDefault(id, pageId);
        // cache[id] = defaultValue;
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
        set(isStealAtom, true);
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
  { newBlockId: string; pageId: string; path: number[] }
>(null, (get, set, update) => {
  const { newBlockId, pageId, path } = update;
  const newBlock = get(blockFamily({ id: newBlockId, pageId }));
  const shallow: ShallowBlock = { id: newBlock.id, children: [] };
  const pageAtom = pageFamily({ id: pageId });
  const pageEngine = new PageEngine(get(pageAtom));
  pageEngine.apendBlockAt(path, shallow);
  set(pageAtom, pageEngine.page);
  set(editingBlockIdAtom, newBlock.id);
});

export const pageValuesAtom = atom((get) => {
  return Object.values(get(pagesAtom));
});

export const usePage = () => {
  return useAtom(pageFamily({ id: useAtomValue(pageIdAtom) }));
};
export const useBlock = (id: string) => {
  const pageId = useAtomValue(pageIdAtom);
  return useAtom(blockFamily({ id, pageId }));
};
