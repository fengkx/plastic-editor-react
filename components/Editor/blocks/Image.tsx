import React from "react";
export const Image: React.FC<{ url: string; alt: string }> = ({ url, alt }) => (
  // eslint-disable-next-line  @next/next/no-img-element
  <img src={url} alt={alt} className="max-w-full" />
);
