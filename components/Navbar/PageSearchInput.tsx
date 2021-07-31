import produce from "immer";
import { atom, useAtom } from "jotai";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import Link from "next/link";
import React, { useState } from "react";
import { useNanoid } from "../../hooks/useNanoid";
import { useAdapter } from "../Editor/adapters/AdapterContext";

const searchInputAtom = atom("");
export function PageSearchInput() {
  const { pageFamily, pageIdAtom } = useAdapter();
  const [searchInput, setSearchInput] = useAtom(searchInputAtom);
  const [isShow, setIsShow] = useState(false);
  const updatePageId = useUpdateAtom(pageIdAtom);
  const [newPageId, genNewPageId] = useNanoid();
  const [newPage, updateNewPage] = useAtom(pageFamily({ id: newPageId }));

  return (
    <div className="relative z-40">
      <input
        onFocusCapture={() => setIsShow(true)}
        onBlurCapture={() => setTimeout(() => setIsShow(false), 500)}
        value={searchInput}
        onChange={(event) => {
          setSearchInput(event.target.value);
        }}
        type="text"
        className="w-full outline-none bg-gray-100 p-2 px-4 rounded"
        placeholder="Search or create page"
      />
      {isShow && (
        <div className="border border-gray-100 shadow-sm absolute left-0 right 0 w-full">
          <Link href={`/note/${newPageId}?title=${searchInput}`}>
            <a
              onClick={() => {
                updatePageId(newPageId);
                updateNewPage(
                  produce(newPage, (draft) => {
                    draft.title = searchInput;
                  })
                );
                genNewPageId();
                setSearchInput("");
              }}
              className="w-full block hover:bg-gray-100 px-4 py-2 text-sm"
            >
              Create {searchInput}
            </a>
          </Link>
          <PageItemList />
        </div>
      )}
    </div>
  );
}

const PageItemList: React.FC = () => {
  const { pageValuesAtom, pageIdAtom } = useAdapter();
  const pages = useAtomValue(pageValuesAtom);
  const searchInput = useAtomValue(searchInputAtom);
  const updatePageId = useUpdateAtom(pageIdAtom);
  return (
    <>
      {pages
        .filter((p) =>
          p.title.toLowerCase().includes(searchInput.toLowerCase())
        )
        .map((page) => (
          <Link key={page.id} href={`/note/${page.id}`}>
            <a
              onClick={() => {
                updatePageId(page.id);
              }}
              key={page.id}
              className="w-full block bg-white hover:bg-gray-100 px-4 py-2 text-sm"
            >
              {page.title}
            </a>
          </Link>
        ))}
    </>
  );
};
