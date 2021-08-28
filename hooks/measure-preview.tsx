// @ts-ignore
import { createRoot } from "react-dom";

import { useEventListener, useMountEffect } from "@react-hookz/web";
import { Preview } from "../components/Block/Preview";
import React, { useState } from "react";

const IFRAME_ID = "plastic_measure_iframe";
export function useMeasurePreview(blockId: string) {
  const [rect, setRect] = useState(null);
  let iframe;
  let root;
  useMountEffect(() => {
    iframe = document.getElementById(IFRAME_ID);
    if (!iframe) {
      iframe = document.createElement("iframe");
    }
    iframe.id = IFRAME_ID;
    iframe.setAttribute(
      "style",
      "position: absolute; top: -50000px; border: 0; z-index: -50000; width: 50000px"
    );
    document.body.appendChild(iframe);
    iframe.addEventListener("load", () => {
      const doc = iframe!.contentDocument!;
      console.log(doc);
      let rootEl = doc.getElementById("root");
      if (!rootEl) {
        rootEl = doc.createElement("div");
        rootEl.id = "root";
        doc.body.appendChild(rootEl);
      }
      console.log(rootEl);
      if (!root) {
        root = createRoot(rootEl);
      }
      root.render(
        <Preview
          blockId={blockId}
          className="inline break-words max-w-md"
          style={{
            overflowWrap: "break-word",
            maxWidth: 320,
            display: "inline-block",
          }}
        />
      );
      const setValue = () => {
        const el = doc.querySelector(".preview");
        if (el) {
          const r = el.getBoundingClientRect();
          setRect(r);
          return r;
        } else {
          setTimeout(setValue, 4);
        }
      };
      setTimeout(() => {
        setValue();
      }, 4);
    });
  });
  return rect;
}
