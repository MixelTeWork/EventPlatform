"use client"
import styles from "./page.module.css"
import { useRef } from "react";
import Popup from "@/components/Popup";
import Button from "@sCmps/Button";
import useStateObj from "@/utils/useStateObj";
import { useRouter } from "next/navigation";

export default function Page()
{
  const router = useRouter();
  const log = useStateObj("");
  const logTitle = useStateObj("Log");
  const refLog = useRef<HTMLPreElement>(null);

  const viewLog = (title: string, path: string) => async () =>
  {
    logTitle.set(title)
    log.set("Loading");
    try
    {
      const res = await fetch(path);
      const data = await res.text();
      log.set(data);
      setTimeout(() => refLog.current?.parentElement?.scrollTo(0, refLog.current?.parentElement?.scrollHeight), 150);
    }
    catch (x) { log.set(JSON.stringify(x)); }
  }

  return (
    <div className={styles.root}>
      <Button text="Users" padding="0.5rem 1rem" onClick={() => router.push("/users")} />
      <Button text="Log" padding="0.5rem 1rem" onClick={() => router.push("/log")} />
      <Button text="Log errors" padding="0.5rem 1rem" onClick={viewLog("Log errors", "/api/debug/log_errors")} />
      <Button text="Log info" padding="0.5rem 1rem" onClick={viewLog("Log info", "/api/debug/log_info")} />
      <Button text="Log requests" padding="0.5rem 1rem" onClick={viewLog("Log requests", "/api/debug/log_requests")} />
      <Button text="Log frontend" padding="0.5rem 1rem" onClick={viewLog("Log frontend", "/api/debug/log_frontend")} />
      <Popup title={logTitle.v} open={log.v != ""} close={() => log.set("")}>
        <pre ref={refLog}>{log.v}</pre>
      </Popup>
    </div>
  );
}
