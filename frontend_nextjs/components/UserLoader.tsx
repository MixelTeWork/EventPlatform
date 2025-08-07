"use client";
import { useUser } from "@/api/user";
import Spinner from "./Spinner";
import displayError from "@/utils/displayError";

export default function UserLoader()
{
	const user = useUser();
	return user.isPending ? <Spinner /> : displayError(user);
}
