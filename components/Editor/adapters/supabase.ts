import { blockDefault, ID_LEN, memoryAdapter, pageDefault } from "./memory";
import { atomFamily, useAtomValue } from "jotai/utils";
import {
  Block,
  Page,
  ShallowBlock,
} from "@plastic-editor/protocol/lib/protocol";
import { atom, useAtom } from "jotai";
import { Note, PartialPick } from "./types";
import { supabase } from "../../../db";
import { definitions } from "../../../types/supabase";
import {
  atomWithDebouncedStorage,
  createJSONStorage,
  SimpleStorage,
  Storage,
} from "../../../atom-util/atomWithDebouncedStorage";
import { nanoid } from "nanoid";
import { PageEngine } from "@plastic-editor/protocol";
import { anchorOffsetAtom, editingBlockIdAtom } from "../store";
import FileSaver from "file-saver";

const DEBOUNCE_WAIT = 5000;
const DEBOUNCE_MAX_WAIT = 10000;

export type TSupabaseAdapter = Omit<
  typeof memoryAdapter,
  "pagesAtom" | "blocksAtom"
>;
const { isStaleAtom, gotoPageAtom, pageIdAtom } = memoryAdapter;

const blockStoarge: SimpleStorage<Block> = {
  getItem: async (id) => {
    const resp = await supabase
      .from<definitions["blocks"]>("blocks")
      .select()
      .eq("block_id", id);
    const dbValue = resp.data?.[0];
    return dbValue?.content ?? null;
  },
  setItem: async (id, value) => {
    await supabase.from<definitions["blocks"]>("blocks").upsert(
      {
        block_id: id,
        content: value,
      },
      { onConflict: "block_id" }
    );
    return;
  },
};

const pageStorage: SimpleStorage<
  Omit<definitions["page_metas"], "owner_id" | "id"> & Page
> = {
  getItem: async (id) => {
    const resp = await supabase
      .from<definitions["page_content"]>("page_content")
      .select()
      .eq("page_id", id);
    debugger;
    const dbValue = resp.data?.[0];
    return dbValue?.content ?? null;
  },
  setItem: async (id, value) => {
    const { is_public = false, is_writable = false } = value;
    await supabase.from<definitions["page_metas"]>("page_metas").upsert(
      {
        page_id: id,
        is_public,
        is_writable,
      },
      { onConflict: "page_id" }
    );
    const page: Page = {
      children: value.children,
      title: value.title,
      id: id,
    };
    await supabase.from<definitions["page_content"]>("page_content").upsert(
      {
        page_id: id,
        content: page,
      },
      { onConflict: "page_id" }
    );
    return;
  },
};
const blockFamily = atomFamily<
  Pick<Block, "id" | "pageId"> & PartialPick<Block, "content">,
  Block,
  Block
>(
  ({ id, pageId, content }) => {
    const defaultValue = blockDefault(id, pageId);
    if (content) defaultValue.content = content;
    return atomWithDebouncedStorage<Block>(
      id,
      defaultValue,
      isStaleAtom,
      DEBOUNCE_WAIT,
      { maxWait: DEBOUNCE_MAX_WAIT },
      blockStoarge as Storage<Block>,
      true
    );
  },
  (a, b) => a.id === b.id && a.pageId === b.pageId
);

const pageFamily = atomFamily<
  Pick<Page, "id"> & PartialPick<Page, "children" | "title">,
  Page,
  Page
>(
  ({ id, children, title }) => {
    const defaultValue = pageDefault(id);
    if (!children) {
      const shallow: ShallowBlock = { id, children: [] };
      defaultValue.children = [shallow];
    }
    if (title) {
      defaultValue.title = title;
    }

    return atomWithDebouncedStorage<Page>(
      id,
      defaultValue,
      isStaleAtom,
      DEBOUNCE_WAIT,
      { maxWait: DEBOUNCE_MAX_WAIT },
      pageStorage as Storage<Page>,
      true
    );
  },
  (a, b) => a.id === b.id
);

const starsAtom = atomWithDebouncedStorage<string[]>(
  "plastic@stars",
  [],
  isStaleAtom,
  DEBOUNCE_WAIT,
  { maxWait: DEBOUNCE_MAX_WAIT },
  {
    async getItem(key) {
      const resp = await supabase.from<definitions["stars"]>("stars").select();
      const dbValue = resp.data?.[0]?.content ?? [];
      if (dbValue) dbValue;
      return [];
    },
    async setItem(key, newVal) {
      const resp = await supabase.from<definitions["stars"]>("stars").upsert({
        content: newVal,
      });
    },
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
    title?: string;
    children?: ShallowBlock[];
    goto?: boolean;
  }
>(null, async (get, set, update) => {
  const { newPageId, title, children, goto } = update;
  debugger;
  await supabase
    .from<definitions["page_metas"]>("page_metas")
    .upsert({ page_id: newPageId, is_public: false, is_writable: false });
  const newPageAtom = pageFamily({ id: newPageId, title, children });
  const newPage = get(newPageAtom);
  console.log({ newPage });
  set(newPageAtom, newPage);
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

const deleteBlockAtom = atom<null, { path: number[]; blockId: string }>(
  null,
  (get, set, update) => {
    const { path, blockId } = update;
    const page = get(pageFamily({ id: get(pageIdAtom) }));
    const pageEngine = new PageEngine(page);
    const [closest, closetPos] = pageEngine.upClosest(path);
    pageEngine.remove(path);
    set(anchorOffsetAtom, Infinity);
    set(editingBlockIdAtom, closest.id);
    const writeDb = async () => {
      await supabase.from<definitions["page_content"]>("page_content").upsert({
        page_id: page.id,
        content: pageEngine.page,
      });
      await supabase
        .from<definitions["blocks"]>("blocks")
        .delete()
        .eq("block_id", blockId);
    };
    writeDb().then(() => set(isStaleAtom, false));
  }
);

const usePage = () => {
  return useAtom(pageFamily({ id: useAtomValue(pageIdAtom) }));
};
const useBlock = (id: string) => {
  const pageId = useAtomValue(pageIdAtom);
  return useAtom(blockFamily({ id, pageId }));
};

const pageValuesAtom = atom(async (get) => {
  const resp = await supabase
    .from<definitions["page_content"]>("page_content")
    .select();
  return resp.data?.map((item) => item.content) ?? [];
});

const loadNotesAtom = atom<null, Note>(null, (get, set, update) => {
  const loadNote = async () => {
    await supabase
      .from<definitions["page_metas"]>("page_metas")
      .upsert(update.pages.map((p) => ({ page_id: p.id })));
    await supabase.from<definitions["page_content"]>("page_content").upsert(
      update.pages.map((p) => ({
        page_id: p.id,
        content: p,
      }))
    );
  };
  loadNote();
  set(starsAtom, update.stars);
});

const saveNotesAtom = atom(null, (get) => {
  const getNotes = async () => {
    let pagesResp = await supabase
      .from<definitions["page_content"]>("page_content")
      .select();
    let starsResp = await supabase.from<definitions["stars"]>("stars").select();
    let blocksResp = await supabase
      .from<definitions["blocks"]>("blocks")
      .select();
    const pages = (pagesResp.data ?? []).map((p) => p.content);
    const blocks = (blocksResp.data ?? [])
      .map((b) => b.content)
      .reduce((acc, cur) => {
        acc[cur.id] = cur;
        return acc;
      }, {});
    const stars = starsResp.data?.[0].content ?? [];

    const note: Note = {
      pages,
      blocks,
      stars,
    };
    return note;
  };
  getNotes().then((note) => {
    const jsonStr = JSON.stringify(note);
    const blob = new Blob([jsonStr], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, "note.json");
  });
});

export const supbaseAdapter: TSupabaseAdapter = {
  isStaleAtom,
  newPageAtom,
  newBlockAtom,
  gotoPageAtom,
  pageIdAtom,
  blockFamily,
  pageFamily,
  starsAtom,
  usePage,
  useBlock,
  moveBlockAtom,
  deleteBlockAtom,
  pageValuesAtom,
  loadNotesAtom,
  saveNotesAtom,
};
