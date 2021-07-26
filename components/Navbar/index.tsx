import { useAtomValue } from "jotai/utils";
import React from "react";
import { isStaleAtom } from "../Editor/adapters/memory";
import { PageSearchInput } from "./PageSearchInput";

export const Navbar: React.FC = (props) => {
  return (
    <nav className="flex p-4 justify-end">
      <IsStaleIndicator />
      <div className="w-64">
        <PageSearchInput />
      </div>
    </nav>
  );
};

const IsStaleIndicator: React.FC = () => {
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
