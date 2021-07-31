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
  const { gotoPageAtom } = useAdapter();
  const router = useRouter();
  const gotoPage = useUpdateAtom(gotoPageAtom);
  useMountEffect(() => {
    gotoPage({ router, today: true });
  });
  return null;
};
export default (
  <AdapterProvider adapter={memoryAdapter}>
    <Home />
  </AdapterProvider>
);
