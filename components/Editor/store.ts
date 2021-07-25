import { atom, useAtom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { Page } from "@plastic-editor/protocol/lib/protocol";

export const editingBlockIdAtom = atom<string | undefined>(undefined);
export const textToAppendAtom = atom("");
export const anchorOffsetAtom = atom(0);
export const LINE_HEIGHT_ATOM = atom<24>((get) => 24);
