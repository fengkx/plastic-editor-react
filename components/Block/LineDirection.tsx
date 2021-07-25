import React from "react";

export const LineDirection = React.memo(
  function () {
    return (
      <div className="pl-4 pr-2" style={{ marginTop: 10 }}>
        <div
          className=" bg-gray-900 rounded-full"
          style={{ height: 6, width: 6 }}
        />
      </div>
    );
  },
  () => true
);
LineDirection.displayName = "LineDirection";
