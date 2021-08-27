import { forwardRef, ReactNode, MouseEventHandler } from "react";

export const Text = forwardRef<
  HTMLElement,
  {
    children?: ReactNode;
    focusTextHelper: (offset: number) => MouseEventHandler<HTMLElement>;
  }
>(function Text({ children, focusTextHelper }, ref) {
  return (
    <span ref={ref} onClickCapture={focusTextHelper(0)}>
      {children}
    </span>
  );
});
