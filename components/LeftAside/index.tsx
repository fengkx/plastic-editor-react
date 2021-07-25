import { ToolButton } from "./ToolButton";
import Link from "next/link";
import type { Page } from "@plastic-editor/protocol/lib/protocol";
import React from "react";
import { useAtom } from "jotai";
import {
  pageFamily,
  pageIdAtom,
  starsAtom,
  usePage,
} from "../Editor/adapters/memory";
import { useAtomValue, useUpdateAtom } from "jotai/utils";

export const LeftAside: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-100">
      <div className="toolbar flex space-x-2 p-4">
        <ToolButton src="/icons/download-2-line.svg" alt="Save button" />
        <ToolButton src="/icons/folderOpen.svg" alt="Open File" />
      </div>
      <div className="font-medium mt-4">
        <Link href="/notes">
          <a className="block px-4 py-1 hover:bg-gray-200">Daily Notes</a>
        </Link>
      </div>
      <div className="mt-8 font-medium">
        <h2 className="px-4 text-gray-500 mb-2">Stared pages</h2>
        <StarPageList />
      </div>
    </aside>
  );
};

function StarPageList() {
  const [stars] = useAtom(starsAtom);
  return (
    <div>
      {stars.map((pageId) => {
        return <StaredPageItem key={pageId} pageId={pageId} />;
      })}
    </div>
  );
}
function StaredPageItem({ pageId }) {
  const page = useAtomValue(pageFamily({ id: pageId }));
  const updatePageId = useUpdateAtom(pageIdAtom);
  return (
    <Link key={page.id} href={`/note/${page.id}`}>
      <a
        onClick={() => {
          updatePageId(page.id);
        }}
        className="block px-4 py-1 hover:bg-gray-200"
      >
        {page.title}
      </a>
    </Link>
  );
}
