import produce from "immer";
import { atom, useAtom } from "jotai";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useNanoid } from "../../hooks/useNanoid";
import { useAdapter } from "../Editor/adapters/AdapterContext";
import { nanoid } from "nanoid";
import { ID_LEN } from "../Editor/adapters/memory";

const searchInputAtom = atom("");
export function PageSearchInput() {
  const { newPageAtom, pageIdAtom } = useAdapter();
  const [searchInput, setSearchInput] = useAtom(searchInputAtom);
  const [isShow, setIsShow] = useState(false);
  const updatePageId = useUpdateAtom(pageIdAtom);
  const [newPageId, genNew] = useNanoid();
  const createNewPage = useUpdateAtom(newPageAtom);
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
                const p = {
                  newPageId,
                  title: searchInput,
                  children: [{ id: nanoid(ID_LEN), children: [] }],
                };
                debugger;
                createNewPage(p);
                updatePageId(newPageId);
                genNew();
                setSearchInput("");
              }}
              className="w-full block hover:bg-gray-100 px-4 py-2 text-sm"
            >
              Create {searchInput}
            </a>
          </Link>
          <Suspense fallback={null}>
            <PageItemList />
          </Suspense>
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
