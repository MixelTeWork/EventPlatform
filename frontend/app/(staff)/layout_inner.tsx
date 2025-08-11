"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/api/user";
import Loading from "../loading";


export default function LayoutInner({
	children,
}: Readonly<{
	children: React.ReactNode;
}>)
{
	const user = useUser();
	const router = useRouter();
	useEffect(() =>
	{
		if (user.isPending) return;
		if (user.data?.auth) return;
		router.push("/");
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user.isPending, user.data?.auth])
	return user.data?.auth ? children : <Loading />;
}
