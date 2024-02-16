import { useMutation } from "react-query";
import { fetchJsonPost } from "../utils/fetch";


export interface Send
{
	id: string,
	value: number,
	positive: boolean,
	reusable: boolean,
}

export function useMutationSend(onSuccess?: (send: Send) => void)
{
	const mutation = useMutation({
		mutationFn: async (data: SendData) =>
			await fetchJsonPost<Send>("/api/send", data),
		onSuccess: onSuccess,
	});
	return mutation;
}

interface SendData
{
	value: number,
	positive: boolean,
	reusable: boolean,
}

export function useMutationCheckSend(onSuccess?: (data: CheckSendData) => void)
{
	const mutation = useMutation({
		mutationFn: async (sendId: string) =>
			await fetchJsonPost<CheckSendData>("/api/send_check", { id: sendId }),
		onSuccess: onSuccess,
	});
	return mutation;
}

interface CheckSendData
{
	successful: boolean,
}
