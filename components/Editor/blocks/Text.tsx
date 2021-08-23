import { MouseEventHandler } from "react";

type PropsType = {
  children?: React.ReactNode;
  focusTextHelper: (offset: number) => MouseEventHandler<HTMLElement>;
};
export function Text({ children, focusTextHelper }: PropsType) {
  return <span onClickCapture={focusTextHelper(0)}>{children}</span>;
}
