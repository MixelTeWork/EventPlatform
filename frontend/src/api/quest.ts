import { useQuery } from "react-query";
import { ApiError, Quest, ResponseMsg } from "./dataTypes";

export default function useQuests()
{
	return useQuery("quests", getQuests);
}

async function getQuests(): Promise<Quest[]>
{
	const res = await fetch("/api/quests");
	const data = await res.json();
	if (!res.ok) throw new ApiError((data as ResponseMsg).msg);

	return data as Quest[];
}
