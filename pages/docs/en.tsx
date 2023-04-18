import { useMountEffect } from "@react-hookz/web";
import { produce } from "immer";
import { useAtom } from "jotai";
import { useSetAtom } from "jotai";
import type { NextPage } from "next";
import {
  AdapterProvider,
  useAdapter,
} from "../../components/Editor/adapters/AdapterContext";
import { memoryAdapter } from "../../components/Editor/adapters/memory";
import { Main } from "../../components/Main";

const blocks = {
  "0-0": {
    id: "0-0",
    pageId: "__docs__",
    content: "An document is make up by many blocks",
    references: [],
  },
  "0-1": {
    id: "0-1",
    pageId: "__docs__",
    content: "You can have lots of nested block",
    references: [],
  },
  "1-0": {
    id: "1-0",
    pageId: "__docs__",
    content: "Press `Tab` to indent",
    references: [],
  },
  "0-2": {
    id: "0-2",
    pageId: "__docs__",
    content: "Press `Shift+Tab` to outindent",
    references: [],
  },
  "0-3": {
    id: "0-3",
    pageId: "__docs__",
    content: "A subset of markdown syntax is supported in blocks",
    references: [],
  },
  "3-0": {
    id: "3-0",
    pageId: "__docs__",
    content: "Such as `Code Block`和**Bold**",
    references: [],
  },
  "3-1": {
    id: "3-1",
    pageId: "__docs__",
    content:
      "For example ![GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)",
    references: [],
  },
  "3-2": {
    id: "3-2",
    pageId: "__docs__",
    content: "You can write {{{TODO}}} 和 {{{DONE}}} todo item like this",
    references: [],
  },
  "3-3": {
    id: "3-3",
    pageId: "__docs__",
    content:
      "You can also have a inline youtube video: \n{{youtube: https://www.youtube.com/watch?v=jrP24ZSYHts}}",
    references: [],
  },
  "0-4": {
    id: "0-4",
    pageId: "__docs__",
    content:
      "All blocks can be edited by clicking on them or dragging the dots in front of the blocks to sort them (this document is read-only)",
    references: [],
  },
};

const pageId = "__docs__";
export const DocIndexPage: NextPage = () => {
  const { blocksAtom, pageFamily, pageIdAtom } =
    useAdapter<typeof memoryAdapter>();
  const setPageId = useSetAtom(pageIdAtom);
  const setPage = useSetAtom(pageFamily({ id: pageId }));
  const [originalBlocks, setBlocks] = useAtom(blocksAtom);
  useMountEffect(() => {
    setPageId(pageId);
    setPage({
      id: pageId,
      title: "Document - Usage",
      children: [
        { id: "0-0", children: [{ id: "1-0", children: [] }] },
        { id: "0-1", children: [] },
        { id: "0-2", children: [] },
        {
          id: "0-3",
          children: [
            { id: "3-0", children: [] },
            { id: "3-1", children: [] },
            { id: "3-2", children: [] },
            { id: "3-3", children: [] },
          ],
        },
        { id: "0-4", children: [] },
      ],
    });
    setBlocks(
      produce(originalBlocks, (draft) => {
        Object.values(blocks).forEach((block) => {
          draft[block.id] = block;
        });
      })
    );
  });
  return <Main />;
};

export default function DocIndex() {
  return (
    <AdapterProvider adapter={memoryAdapter}>
      <DocIndexPage />
    </AdapterProvider>
  );
}
