import { useMountEffect } from "@react-hookz/web";
import { format } from "date-fns";
import { useAtomValue } from "jotai/utils";
import { nanoid } from "nanoid";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { ID_LEN, pageValuesAtom } from "../components/Editor/adapters/memory";
const Home: NextPage = () => {
  const router = useRouter();
  const pages = useAtomValue(pageValuesAtom);
  useMountEffect(() => {
    const title = format(new Date(), "MMMM, dd, yyyy");
    const id = pages.find((p) => p.title === title)?.id ?? nanoid(ID_LEN);
    router.push(`/note/${id}`);
  });
  return null;
};
export default Home;
