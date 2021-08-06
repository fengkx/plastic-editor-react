import { MouseEventHandler } from "react";

export type PropType = {
  content: string;
  focusTextHelper: (offset?: number) => MouseEventHandler<HTMLElement>;
};
export const Bold: React.FC<PropType> = ({ content, focusTextHelper }) => {
  return <strong onClickCapture={focusTextHelper(2)}>{content}</strong>;
};
