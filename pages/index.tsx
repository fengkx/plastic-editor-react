import { useMountEffect } from "@react-hookz/web";
import { useUpdateAtom } from "jotai/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import {
  AdapterProvider,
  useAdapter,
} from "../components/Editor/adapters/AdapterContext";
import { Loading } from "../components/Loading";

const HomePage: NextPage = () => {
  const { gotoPageAtom } = useAdapter();
  const router = useRouter();
  const gotoPage = useUpdateAtom(gotoPageAtom);
  useMountEffect(() => {
    gotoPage({ router, today: true, replace: true });
  });
  return (
    <div className="grid place-items-center h-screen">
      <Loading className=" w-64 h-64" />
    </div>
  );
};
export default function Home() {
  return (
    <AdapterProvider>
      <HomePage />
    </AdapterProvider>
  );
}
