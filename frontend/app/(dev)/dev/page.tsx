"use client"
import styles from "./page.module.css"
import { useRef } from "react";
import Popup from "@/components/Popup";
import Button from "@sCmps/Button";
import useStateObj from "@/utils/useStateObj";
import { useRouter } from "next/navigation";
import useStateBool from "@/utils/useStateBool";
import getMsgFromBack from "@/api/getMsgFromBack";
import Textarea from "@sCmps/Textarea";
import { useMutationSetMsg } from "@/api/log";
import displayError from "@/utils/displayError";
import Spinner from "@/components/Spinner";

export default function Page()
{
  const router = useRouter();
  const log = useStateObj("");
  const logTitle = useStateObj("Log");
  const refLog = useRef<HTMLPreElement>(null);
  const setMsgOpen = useStateBool(false);
  const msg = useStateObj(getMsgFromBack() || "");
  const setMsg = useMutationSetMsg(v => msg.set(v.msg));

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
      <Button text="Log errors" padding="0.5rem 1rem" onClick={viewLog("Log errors", "/api/dev/log_errors")} />
      <Button text="Log info" padding="0.5rem 1rem" onClick={viewLog("Log info", "/api/dev/log_info")} />
      <Button text="Log requests" padding="0.5rem 1rem" onClick={viewLog("Log requests", "/api/dev/log_requests")} />
      <Button text="Log frontend" padding="0.5rem 1rem" onClick={viewLog("Log frontend", "/api/dev/log_frontend")} />
      <a href="/dev/dashboard" target="_blank">
        <Button text="Dashboard" padding="0.5rem 1rem" />
      </a>
      <Popup title={logTitle.v} open={log.v != ""} close={() => log.set("")}>
        <pre ref={refLog}>{log.v}</pre>
      </Popup>
      <Button text="Set msg" padding="0.5rem 1rem" onClick={setMsgOpen.setT} />
      <Popup title={"Set msg"} openState={setMsgOpen}>
        <div className={styles.popup}>
          {setMsg.isPending && <Spinner />}
          {displayError(setMsg)}
          <Textarea stateObj={msg} />
          <Button text="Set" onClick={() => setMsg.mutate({ msg: msg.v })} />
        </div>
      </Popup>
    </div>
  );
}
