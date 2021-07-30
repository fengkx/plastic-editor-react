import { useMountEffect } from "@react-hookz/web";
import { useUpdateAtom } from "jotai/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { gotoTodayPageAtom } from "../components/Editor/adapters/memory";
const Home: NextPage = () => {
  const router = useRouter();
  const gotoTodayPage = useUpdateAtom(gotoTodayPageAtom);
  useMountEffect(() => {
    gotoTodayPage({ router });
  });
  return null;
};
export default Home;
