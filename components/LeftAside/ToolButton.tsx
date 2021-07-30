import React from "react";

export type PropsType = {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  onClick?: (mouseEvent: React.MouseEvent<HTMLButtonElement>) => void;
};

export const ToolButton: React.FC<PropsType> = ({
  src,
  alt,
  onClick,
  style,
}) => {
  return (
    <button className="bg-white rounded p-1" onClick={onClick} style={style}>
      {/* eslint-disable-next-line  @next/next/no-img-element */}
      <img src={src} alt={alt} />
    </button>
  );
};
