import { Block } from "@plastic-editor/protocol/lib/protocol";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai/utils";
import { useCallback } from "react";
import { Editor } from "./Editor";
import { useAdapter } from "./Editor/adapters/AdapterContext";
import { Reference } from "./Reference";
import produce from "immer";

function Title() {
  const { usePage } = useAdapter();
  const [page, setPage] = usePage();
  return (
    <>
      <input
        value={page.title}
        onChange={(ev) => {
          setPage(
            produce(page, (draft) => {
              draft.title = ev.target.value;
            })
          );
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
  const { pageIdAtom, starsAtom } = useAdapter();
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
