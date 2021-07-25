import React from "react";

export type PropType = {
  content: string;
};
export const Code: React.FC<PropType> = ({ content }) => {
  return <code className="bg-gray-100 box-border px-1">{content}</code>;
};
