import { memo as ReactMemo } from "react";
import type { useDrag } from "react-dnd";
type TDragRef = ReturnType<typeof useDrag>[1];
const LineDirectionImpl: React.FC<{ dragRef: TDragRef }> = ({ dragRef }) => {
  return (
    <div className="pl-4 pr-2" style={{ marginTop: 2 }}>
      <div
        ref={dragRef}
        className="hover:bg-gray-200 rounded-full flex justify-center items-center cursor-move"
        style={{ height: 20, width: 20 }}
      >
        <div
          className="rounded-full bg-gray-900"
          style={{ height: 8, width: 8 }}
        ></div>
      </div>
    </div>
  );
};

export const LineDirection = ReactMemo(LineDirectionImpl, () => true);
LineDirection.displayName = "LineDirection";
