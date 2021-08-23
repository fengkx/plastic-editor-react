import { BigCircleLoading } from "../../components/Loading";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useMountEffect } from "@react-hookz/web";

export default function NotePage() {
  const router = useRouter();
  useMountEffect(() => {
    if (/^(?:zh|zh-CN)$/.test(navigator.language)) {
      router.replace("/docs/zh");
    } else {
      router.replace("/docs/en");
    }
  });
  return (
    <div className="grid place-items-center h-screen">
      <BigCircleLoading className=" w-64 h-64" />
    </div>
  );
}
