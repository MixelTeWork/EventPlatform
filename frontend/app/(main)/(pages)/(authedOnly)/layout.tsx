"use client"
import { useRouter } from "next/navigation";
import { useUser } from "@/api/user";
import { useEffect } from "react";
import Loading from "@/components/Loading";


export default function Layout({
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
	if (user.data?.auth) return children;
	return <Loading />
}
