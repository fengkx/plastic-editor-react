import { Suspense } from "react";
import { useAtomValue } from "jotai/utils";
import { useAdapter } from "../Editor/adapters/AdapterContext";
import { PageSearchInput } from "./PageSearchInput";
import { Loading } from "../Loading";

export const Navbar: React.FC = (props) => {
  return (
    <nav className="flex p-4 justify-end">
      <IsStaleIndicator />
      <div className="w-64">
        <Suspense fallback={"Loading"}>
          <PageSearchInput />
        </Suspense>
      </div>
    </nav>
  );
};

const IsStaleIndicator: React.FC = () => {
  const { isStaleAtom } = useAdapter();
  const isStale = useAtomValue(isStaleAtom);
  return (
    <div className="flex-1">
      <span
        className={`${
          isStale ? "bg-yellow-500" : "bg-green-500"
        } w-2 h-2 block rounded-full`}
      />
    </div>
  );
};
