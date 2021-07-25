import React from "react";
import { useAtomValue } from "jotai/utils";
import { isStealAtom } from "../Editor/adapters/memory";
import { PageSearchInput } from "./PageSearchInput";

export type PropsType = {};
export const Navbar: React.FC<PropsType> = (props) => {
  const isSteal = useAtomValue(isStealAtom);
  return (
    <nav className="flex p-4 justify-end">
      {/*<div className="flex-1">*/}
      {/*    <span*/}
      {/*        className={`${*/}
      {/*            isSteal ? "bg-yellow-500" : "bg-green-500"*/}
      {/*        } w-2 h-2 block rounded-full`}*/}
      {/*    />*/}
      {/*</div>*/}
      <div className="w-64">
        <PageSearchInput />
      </div>
    </nav>
  );
};
