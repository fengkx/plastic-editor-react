import { MouseEventHandler } from "react";
import Link from "next/link";

export type PropsType = {
  url: string;
  alt: string;
};

const stopPropagation: MouseEventHandler<HTMLAnchorElement> = (ev) => {
  ev.stopPropagation();
};
export const HyperLink: React.FC<PropsType> = ({ url, alt }) => (
  <Link href={url}>
    <a
      className="text-blue-600 hover:underline"
      href={url}
      onClickCapture={stopPropagation}
    >
      {alt}
    </a>
  </Link>
);
