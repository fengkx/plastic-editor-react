import React from "react";

export type PropsType = {
  src: string;
  alt: string;
  onClick?: (mouseEvent: React.MouseEvent<HTMLButtonElement>) => void;
};

export const ToolButton: React.FC<PropsType> = ({ src, alt, onClick }) => {
  return (
    <button className="bg-white rounded p-1" onClick={onClick}>
      {/* eslint-disable-next-line  @next/next/no-img-element */}
      <img src={src} alt={alt} />
    </button>
  );
};
