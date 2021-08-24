import {
  blockDefault,
  ID_LEN,
  memoryAdapter,
  pageDefault,
  todayPageUpdate,
  starsKey,
  pagesKey,
  blocksKey,
  storage,
} from "./memory";
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
  SimpleStorage,
  Storage,
} from "../../../atom-util/atomWithDebouncedStorage";
import { PageEngine } from "@plastic-editor/protocol";
import { anchorOffsetAtom, editingBlockIdAtom } from "../store";
import FileSaver from "file-saver";
import { format } from "date-fns";
import { nanoid } from "nanoid";

const DEBOUNCE_WAIT = 1000;
const DEBOUNCE_MAX_WAIT = 2500;

export type TSupabaseAdapter = Omit<
  typeof memoryAdapter,
  "pagesAtom" | "blocksAtom"
>;
const { isStaleAtom, pageIdAtom } = memoryAdapter;

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
    const localValue = storage.getItem(blocksKey) as Record<string, Block>;
    localValue[id] = value;
    storage.setItem(blocksKey, localValue);
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
    const dbValue = resp.data?.[0];
    return dbValue?.content ?? null;
  },
  setItem: async (id, value) => {
    const page: Page = {
      children: value.children,
      title: value.title,
      id: id,
    };
    const localValue = storage.getItem(pagesKey) as Record<string, Page>;
    localValue[id] = page;
    storage.setItem(pagesKey, localValue);
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
      return dbValue;
    },
    async setItem(key, newVal) {
      storage.setItem(starsKey, newVal);
      const resp = await supabase.from<definitions["stars"]>("stars").upsert(
        {
          content: newVal,
        },
        { onConflict: "owner_id" }
      );
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
  await supabase.from<definitions["page_metas"]>("page_metas").upsert(
    {
      page_id: newPageId,
      is_public: false,
      is_writable: false,
    },
    { onConflict: "page_id" }
  );
  pageFamily({ id: newPageId, title, children });
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

const deleteBlockAtom = atom<null, { path: number[]; blockId: string }>(
  null,
  (get, set, update) => {
    const { path, blockId } = update;
    const pageAtom = pageFamily({ id: get(pageIdAtom) });
    const page = get(pageAtom);
    const pageEngine = new PageEngine(page);
    const [closest, closetPos] = pageEngine.upClosest(path);
    pageEngine.remove(path);
    const writeDb = async () => {
      await supabase.from<definitions["page_content"]>("page_content").upsert(
        {
          page_id: page.id,
          content: pageEngine.page,
        },
        { onConflict: "page_id" }
      );
    };
    writeDb()
      .then(() => {
        set(isStaleAtom, false);
        set(pageAtom, pageEngine.page);
        set(anchorOffsetAtom, Infinity);
        set(editingBlockIdAtom, closest.id);
      })
      .finally(() => {
        supabase
          .from<definitions["blocks"]>("blocks")
          .delete()
          .eq("block_id", blockId);
      });
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
    .select("content");
  return resp.data?.map((item) => item.content) ?? [];
});

const loadNotesAtom = atom<null, Note>(null, (get, set, update) => {
  const loadNote = async () => {
    await supabase.from<definitions["page_metas"]>("page_metas").upsert(
      update.pages.map((p) => ({ page_id: p.id })),
      { onConflict: "page_id" }
    );
    const promises = [
      supabase.from<definitions["page_content"]>("page_content").upsert(
        update.pages.map((p) => ({
          page_id: p.id,
          content: p,
        })),
        { onConflict: "page_id" }
      ),
      supabase.from<definitions["blocks"]>("blocks").upsert(
        Object.values(update.blocks).map((b) => ({
          block_id: b.id,
          content: b,
        })),
        { onConflict: "block_id" }
      ),
    ];
    return Promise.all(promises as any);
  };

  loadNote().then((res) => {
    const currPageId = get(pageIdAtom);
    const [pageContentResp, blockResp] = res;
    const pageContents = (pageContentResp as any)
      .data as definitions["page_content"][];
    let currPage = pageContents.find((p) => p.page_id === currPageId);
    if (currPage) {
      set(pageFamily({ id: currPageId }), currPage.content);
    }
    ((blockResp as any).data as definitions["blocks"][])
      .filter((b) => b.content.pageId === currPageId)
      .forEach((b) => {
        set(blockFamily({ id: b.block_id!, pageId: currPageId }), b.content);
      });
    const stared = get(starsAtom);
    const newStars = new Set([...stared, ...(update.stars ?? [])]);
    set(starsAtom, [...newStars]);
  });
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
    const stars = starsResp.data?.[0]?.content ?? [];

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
const gotoPageAtom = atom<null, todayPageUpdate>(
  null,
  async (get, set, update) => {
    let path: string, id: string;
    if (update.today) {
      const title = format(new Date(), "MMMM, dd, yyyy");
      const resp = await supabase
        .from("page_content")
        .select("page_id")
        .eq("content->>title", title);
      const page: Pick<definitions["page_content"], "page_id"> =
        resp?.data?.[0];
      if (!page) {
        id = nanoid(ID_LEN);
        set(newPageAtom, {
          newPageId: id,
          title,
        });
      } else {
        id = page.page_id!;
      }

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
  }
);

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
