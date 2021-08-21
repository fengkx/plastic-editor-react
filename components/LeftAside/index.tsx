import { useAtom } from "jotai";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, Suspense } from "react";
import { useAdapter } from "../Editor/adapters/AdapterContext";
import { Note } from "../Editor/adapters/types";
import { ToolButton } from "./ToolButton";
import { DotFlashing } from "../Loading";
import { hasSupabase, supabase } from "../../db";
export const LeftAside: React.FC = () => {
  const router = useRouter();
  const { gotoPageAtom, loadNotesAtom, saveNotesAtom } = useAdapter();
  const saveNote = useUpdateAtom(saveNotesAtom);
  const loadNote = useUpdateAtom(loadNotesAtom);
  const gotoPage = useUpdateAtom(gotoPageAtom);
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
          imgWidth={24}
          imgHeight={24}
          src="/icons/download-2-line.svg"
          alt="Save"
          onClick={saveNote}
        />
        <input
          className="hidden"
          onChange={onUploadFile}
          id="import"
          type="file"
        />
        <label
          htmlFor="import"
          title="Load Note"
          className="cursor-pointer bg-white p-1"
        >
          {/* eslint-disable-next-line  @next/next/no-img-element */}
          <img
            width={24}
            height={24}
            src="/icons/folderOpen.svg"
            alt="Open File"
          />
        </label>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <ToolButton
          src="/icons/help.svg"
          alt="Help"
          imgWidth={24}
          imgHeight={24}
          onClick={() => {
            if (/^(?:zh|zh-CN)$/.test(navigator.language)) {
              gotoPage({
                router,
                path: "/docs/zh",
                id: "__docs__",
                today: false,
              });
            } else {
              gotoPage({
                router,
                path: "/docs/en",
                id: "__docs__",
                today: false,
              });
            }
          }}
        />
        {hasSupabase && (
          <>
            {supabase.auth.session() ? (
              <ToolButton
                src="/icons/log-out.svg"
                alt="Logout"
                imgWidth={24}
                imgHeight={24}
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.reload();
                }}
              />
            ) : (
              <ToolButton
                src="/icons/log-in.svg"
                alt="Logout"
                imgWidth={24}
                imgHeight={24}
                onClick={() => {
                  router.push("/login");
                }}
              />
            )}
          </>
        )}
      </div>
      <div className="font-medium mt-4">
        <a
          onClick={() => {
            gotoPage({ router, today: true });
          }}
          className="block px-4 py-1 hover:bg-gray-200 cursor-pointer"
        >
          Daily Notes
        </a>
      </div>
      <div className="mt-8 font-medium">
        <h2 className="px-4 text-gray-500 mb-2">Stared pages</h2>
        <Suspense
          fallback={<DotFlashing className="block px-4 py-1 text-lg" />}
        >
          <StarPageList />
        </Suspense>
      </div>
    </aside>
  );
};

function StarPageList() {
  const { starsAtom } = useAdapter();
  const stars = useAtomValue(starsAtom);
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
