"use client"
import type { Operation } from "@/api/operations";
import hasPermission from "@/api/operations";
import { useUser } from "@/api/user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function useSecuredPage(operation: Operation)
{
	const user = useUser();
	const router = useRouter();
	useEffect(() =>
	{
		if (user.isPending) return;
		if (!hasPermission(user, operation))
			router.push("/");
	}, [user.isPending, user.data?.auth])
}
