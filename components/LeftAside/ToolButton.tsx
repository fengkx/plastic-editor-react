import React, { ImgHTMLAttributes } from "react";

type ImageAttrsType = ImgHTMLAttributes<HTMLIFrameElement>;
export type PropsType = {
  src: string;
  alt: string;
  imgWidth?: ImageAttrsType["width"];
  imgHeight?: ImageAttrsType["height"];
  style?: React.CSSProperties;
  onClick?: (mouseEvent: React.MouseEvent<HTMLButtonElement>) => void;
};

export const ToolButton: React.FC<PropsType> = ({
  src,
  alt,
  imgWidth,
  imgHeight,
  onClick,
  style,
}) => {
  return (
    <button className="bg-white rounded p-1" onClick={onClick} style={style}>
      {/* eslint-disable-next-line  @next/next/no-img-element */}
      <img width={imgWidth} height={imgHeight} src={src} alt={alt} />
    </button>
  );
};
