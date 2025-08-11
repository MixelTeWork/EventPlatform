import { stdMutation } from "@/utils/mutations";


export interface Send
{
	id: string,
	value: number,
	positive: boolean,
	reusable: boolean,
}

const url = "/api/send"

interface SendData
{
	value: number,
	positive: boolean,
	reusable: boolean,
}
export const useMutationSend = stdMutation<SendData, Send>(url);

interface CheckSendData { successful: boolean }
export const useMutationCheckSend = stdMutation<string, CheckSendData>(url + "_check", undefined, id => ({ id }));
