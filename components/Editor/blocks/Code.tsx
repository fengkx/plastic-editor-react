import { MouseEventHandler, forwardRef } from "react";

export type PropType = {
  content: string;
  focusTextHelper: (offset?: number) => MouseEventHandler<HTMLElement>;
};

export const Code = forwardRef<HTMLElement, PropType>(function Code(
  { content, focusTextHelper },
  ref
) {
  return (
    <code
      ref={ref}
      className="bg-gray-100 box-border px-1"
      onClickCapture={focusTextHelper(1)}
    >
      {content}
    </code>
  );
});
