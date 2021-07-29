import { atom } from "jotai";

export const editingBlockIdAtom = atom<string | undefined>(undefined);
export const anchorOffsetAtom = atom(0);
export const LINE_HEIGHT_ATOM = atom<24>((get) => 24);
