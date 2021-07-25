import React, { useCallback, useEffect, useMemo } from "react";
import { Block, Page } from "@plastic-editor/protocol/lib/protocol";
import { Reference } from "./Reference";
import { atom, useAtom } from "jotai";
import { Editor } from "./Editor";
import { focusAtom } from "jotai/optics";
import { pageFamily, pageIdAtom, starsAtom } from "./Editor/adapters/memory";
import produce from "immer";
import { useAtomValue, useUpdateAtom } from "jotai/utils";

// const titleTextAtom = atom((get => {
//     console.log(get(pageFamily({id: get(pageIdAtom)})).title, 123)
//     return get(pageFamily({id: get(pageIdAtom)})).title
// }), ((get, set, update) => {
//     const page = get(pageFamily({id: get(pageIdAtom)}));
//     set(pageFamily({id: get(pageIdAtom)}), produce<Page>(page, draft => {
//         draft.title = (update as string)
//     }));
// }))

const pageTitleAtom = atom(
  (get) => {
    const title = get(pageFamily({ id: get(pageIdAtom) })).title;
    return title;
  },
  (get, set, update) => {
    const page = get(pageFamily({ id: get(pageIdAtom) }));
    const newPage = produce(page, (draft) => {
      draft.title = update as string;
    });
    set(pageFamily({ id: get(pageIdAtom) }), newPage);
  }
);

function Title() {
  const [title, setTitle] = useAtom(pageTitleAtom);
  return (
    <>
      <input
        value={title}
        onChange={(ev) => {
          setTitle(ev.target.value);
        }}
        type="text"
        className="outline-none text-4xl font-bold w-full"
        placeholder="Page title"
      />
    </>
  );
}
type ReferenceType = { [key: string]: Block[] };

export const Note: React.FC = () => {
  const references = {};

  return (
    <div className="mt-4 mx-48">
      <div>
        <Title />
      </div>
      <div className="mt-4">
        <StarButton />
      </div>
      <div className="mt-12 -ml-3">
        <Editor />
      </div>
      <div className="mt-12">
        <h2 className="font-medium text-gray-300">References</h2>
        {references &&
          Object.keys(references).map((pageId) => <Reference key={pageId} />)}
      </div>
    </div>
  );
};

function StarButton() {
  const pageId = useAtomValue(pageIdAtom);
  const [stars, setStars] = useAtom(starsAtom);
  const hasStar = stars.includes(pageId);
  const handleStarClick = useCallback(() => {
    if (hasStar) {
      setStars(stars.filter((s) => s !== pageId));
    } else {
      setStars([pageId, ...stars]);
    }
  }, [hasStar, stars, setStars, pageId]);
  return (
    <button className="underline text-sm" onClick={handleStarClick}>
      {hasStar ? "Unstar" : "Star"}
    </button>
  );
}
