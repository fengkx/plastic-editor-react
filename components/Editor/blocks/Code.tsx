import React, { MouseEventHandler } from "react";

export type PropType = {
  content: string;
  focusTextHelper: (offset?: number) => MouseEventHandler<HTMLElement>;
};
export const Code: React.FC<PropType> = ({ content, focusTextHelper }) => {
  return (
    <code
      className="bg-gray-100 box-border px-1"
      onClickCapture={focusTextHelper(1)}
    >
      {content}
    </code>
  );
};
