"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/api/user";
import Loading from "../loading";
import hasPermission from "@/api/operations";


export default function LayoutInner({
	children,
}: Readonly<{
	children: React.ReactNode;
}>)
{
	const user = useUser();
	const router = useRouter();
	const canSee = hasPermission(user, "page_dev");
	useEffect(() =>
	{
		if (user.isPending) return;
		if (!user.data?.auth)
			router.push("/");
		else if (!canSee)
			router.replace("/403");
	}, [user.isPending, user.data?.auth, canSee])
	return canSee ? children : <Loading />;
}
