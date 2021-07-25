import { useMountEffect } from "@react-hookz/web";
import { nanoid } from "nanoid";
import type { NextPage } from "next";
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
