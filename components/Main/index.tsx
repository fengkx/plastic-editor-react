import { LeftAside } from "../LeftAside";
import { Navbar } from "../Navbar";
import { Note } from "../Note";

export function Main() {
  return (
    <div className="flex h-screen">
      <LeftAside />
      <div className="flex-1 overflow scroll">
        <Navbar />
        <Note />
      </div>
    </div>
  );
}
