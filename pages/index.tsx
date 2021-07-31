import { useMountEffect } from "@react-hookz/web";
import { useUpdateAtom } from "jotai/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import {
  AdapterProvider,
  useAdapter,
} from "../components/Editor/adapters/AdapterContext";
import { memoryAdapter } from "../components/Editor/adapters/memory";

const Home: NextPage = () => {
  const { gotoTodayPageAtom } = useAdapter();
  const router = useRouter();
  const gotoTodayPage = useUpdateAtom(gotoTodayPageAtom);
  useMountEffect(() => {
    gotoTodayPage({ router });
  });
  return null;
};
export default (
  <AdapterProvider adapter={memoryAdapter}>
    <Home />
  </AdapterProvider>
);
