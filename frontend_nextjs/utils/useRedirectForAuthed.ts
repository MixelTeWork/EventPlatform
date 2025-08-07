import { useUser } from "@/api/user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function useRedirectForAuthed(href: string, replace = true)
{
	const user = useUser();
	const router = useRouter();
	useEffect(() =>
	{
		if (!user.data?.auth) return;
		if (replace) router.replace(href);
		else router.push(href);
	}, [user.data?.auth])
}