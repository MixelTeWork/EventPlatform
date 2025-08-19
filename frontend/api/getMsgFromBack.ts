import getCookie from "@/utils/getCookies";

export default function getMsgFromBack()
{
	return getCookie("MESSAGE_TO_FRONTEND");
}
