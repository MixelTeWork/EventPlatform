"use client";
import { useUser } from "@/api/user";
import Spinner from "./Spinner";

export default function UserLoader()
{
	const user = useUser();
	return user.isPending ? <Spinner /> : null;
}
