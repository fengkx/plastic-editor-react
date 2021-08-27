import { forwardRef } from "react";
import Link from "next/link";

export type PropsType = {
  url: string;
  alt: string;
};

const stopPropagation = (ev) => {
  ev.stopPropagation();
};

export const HyperLink = forwardRef<HTMLAnchorElement, PropsType>(
  function HyperLink({ url, alt }, ref) {
    return (
      <Link href={url}>
        <a
          ref={ref}
          className="text-blue-600 hover:underline"
          href={url}
          onClickCapture={stopPropagation}
        >
          {alt}
        </a>
      </Link>
    );
  }
);
