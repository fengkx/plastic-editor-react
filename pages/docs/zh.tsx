import { useMountEffect } from "@react-hookz/web";
import produce from "immer";
import { useAtom } from "jotai";
import { useUpdateAtom } from "jotai/utils";
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
    content: "一个文档由一个个的block组成",
    references: [],
  },
  "0-1": {
    id: "0-1",
    pageId: "__docs__",
    content: "你可以有很多嵌套的block",
    references: [],
  },
  "1-0": {
    id: "1-0",
    pageId: "__docs__",
    content: "按键盘快捷键`Tab`可以增加一层嵌套",
    references: [],
  },
  "0-2": {
    id: "0-2",
    pageId: "__docs__",
    content: "按`Shift+Tab`可以取消一层嵌套",
    references: [],
  },
  "0-3": {
    id: "0-3",
    pageId: "__docs__",
    content: "block内支持部分markdown语法和特殊标记语法",
    references: [],
  },
  "3-0": {
    id: "3-0",
    pageId: "__docs__",
    content: "例如`代码块`和**加粗**",
    references: [],
  },
  "3-1": {
    id: "3-1",
    pageId: "__docs__",
    content:
      "例如![GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)",
    references: [],
  },
  "3-2": {
    id: "3-2",
    pageId: "__docs__",
    content: "同时还支持 {{{TODO}}} 和 {{{DONE}}} 的代办事项语法",
    references: [],
  },
  "3-3": {
    id: "3-3",
    pageId: "__docs__",
    content:
      "还有Youtube内嵌视频iframe语法: \n{{youtube: https://www.youtube.com/watch?v=jrP24ZSYHts}}",
    references: [],
  },
  "0-4": {
    id: "0-4",
    pageId: "__docs__",
    content: "所有的block都可以点击编辑或者拖动block前面的圆点排序(本文档只读)",
    references: [],
  },
};

const pageId = "__docs__";
export const DocIndexPage: NextPage = () => {
  const { blocksAtom, pageFamily, pageIdAtom } =
    useAdapter<typeof memoryAdapter>();
  const setPageId = useUpdateAtom(pageIdAtom);
  const setPage = useUpdateAtom(pageFamily({ id: pageId }));
  const [originalBlocks, setBlocks] = useAtom(blocksAtom);
  useMountEffect(() => {
    setPageId(pageId);
    setPage({
      id: pageId,
      title: "文档 - 使用说明",
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
