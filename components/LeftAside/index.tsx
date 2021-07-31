import { useAtom } from "jotai";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback } from "react";
import { useAdapter } from "../Editor/adapters/AdapterContext";
import { Note } from "../Editor/adapters/types";
import { ToolButton } from "./ToolButton";
export const LeftAside: React.FC = () => {
  const router = useRouter();
  const { gotoTodayPageAtom, loadNotesAtom, saveNotesAtom } = useAdapter();
  const saveNote = useUpdateAtom(saveNotesAtom);
  const loadNote = useUpdateAtom(loadNotesAtom);
  const gotoTodayPage = useUpdateAtom(gotoTodayPageAtom);
  const onUploadFile = useCallback(
    async (ev) => {
      const file = ev!.target!.files![0] as File;
      const text = await file.text();
      const note = JSON.parse(text) as Note;
      loadNote(note);
    },
    [loadNote]
  );
  return (
    <aside className="w-64 bg-gray-100 flex-shrink-0 h-screen">
      <div className="toolbar flex space-x-2 p-4">
        <ToolButton
          src="/icons/download-2-line.svg"
          alt="Save button"
          onClick={saveNote}
        />
        <input
          className="hidden"
          onChange={onUploadFile}
          id="import"
          type="file"
        />
        <label htmlFor="import" className="cursor-pointer">
          {/* eslint-disable-next-line  @next/next/no-img-element */}
          <img
            src="/icons/folderOpen.svg"
            alt="Open File"
            className="bg-white rounded p-1"
          />
        </label>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/docs">
          <ToolButton src="/icons/help.svg" alt="Help" />
        </a>
      </div>
      <div className="font-medium mt-4">
        <Link href="/">
          <a
            onClick={() => {
              gotoTodayPage({ router });
            }}
            className="block px-4 py-1 hover:bg-gray-200"
          >
            Daily Notes
          </a>
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
  const { starsAtom } = useAdapter();
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
  const { pageFamily, pageIdAtom } = useAdapter();
  const page = useAtomValue(pageFamily({ id: pageId }));
  const updatePageId = useUpdateAtom(pageIdAtom);
  return (
    <Link
      key={page.id}
      href={`/${page.id !== "__docs__" ? `note/${page.id}` : "docs"}`}
    >
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
