import React from "react";

export type PropType = {
  content: string;
};
export const Bold: React.FC<PropType> = ({ content }) => {
  return <strong>{content}</strong>;
};
