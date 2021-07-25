import type { NextPage } from "next";
import { Main } from "../components/Main";
import { nanoid } from "nanoid";
import { useMountEffect, useRerender } from "@react-hookz/web";
import { useRouter } from "next/router";
import { IDLEN } from "../components/Editor/adapters/memory";
const Home: NextPage = () => {
  const router = useRouter();
  useMountEffect(() => {
    router.push(`/note/${nanoid(IDLEN)}`);
  });
  return null;
};
export default Home;
