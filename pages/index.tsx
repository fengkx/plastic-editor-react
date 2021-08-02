import { useMountEffect } from "@react-hookz/web";
import { useUpdateAtom } from "jotai/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import {
  AdapterProvider,
  useAdapter,
} from "../components/Editor/adapters/AdapterContext";
import { memoryAdapter } from "../components/Editor/adapters/memory";
import { Loading } from "../components/Loading";

const HomePage: NextPage = () => {
  const { gotoPageAtom } = useAdapter();
  const router = useRouter();
  const gotoPage = useUpdateAtom(gotoPageAtom);
  useMountEffect(() => {
    gotoPage({ router, today: true });
  });
  return (
    <div className="grid place-items-center h-screen">
      <Loading className=" w-64 h-64" />
    </div>
  );
};
export default function Home() {
  return (
    <AdapterProvider adapter={memoryAdapter}>
      <HomePage />
    </AdapterProvider>
  );
}
