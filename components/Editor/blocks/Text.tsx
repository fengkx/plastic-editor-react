export function Text({ children, focusTextHelper }) {
  return <span onClickCapture={focusTextHelper(0)}>{children}</span>;
}
