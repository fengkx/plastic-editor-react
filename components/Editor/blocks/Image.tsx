import { forwardRef } from "react";

export const Image = forwardRef<HTMLImageElement, { url: string; alt: string }>(
  function Image({ url, alt }, ref) {
    return (
      // eslint-disable-next-line  @next/next/no-img-element
      <img ref={ref} src={url} alt={alt} className="max-w-full" />
    );
  }
);
