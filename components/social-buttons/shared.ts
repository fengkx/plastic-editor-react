import { CSSProperties, MouseEvent } from "react";
export const commonClasses =
  "block px-4 py-2 text-xl  font-semibold text-lg overflow-hidden rounded shadow";

export type PropsType = {
  className?: string;
  style?: CSSProperties;
  onClick: (ev: MouseEvent<HTMLButtonElement>) => void;
};
