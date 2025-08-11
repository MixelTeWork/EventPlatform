import { stdQuery } from "@/utils/query";
import { stdMutation } from "@/utils/mutations";

interface Stats
{
	group1_members: number,
	group1_completed: number,
	group2_members: number,
	group2_completed: number,
}

const url = "/api/other"
const queryKeyStats = () => ["stats"];
const queryKeyTicketLoginEnabled = () => ["ticketLoginEnabled"];


export const useStats = stdQuery<Stats>(queryKeyStats(), url + "/stats");
export const useTicketLoginEnabled = stdQuery<{ value: boolean }>(queryKeyTicketLoginEnabled(), url + "/ticketLoginEnabled");

export const useMutationTicketLoginEnabled = stdMutation<boolean, { value: boolean }>(url + "/ticketLoginEnabled", (qc, data) =>
{
	qc.setQueryData(queryKeyTicketLoginEnabled(), data);
}, value => ({ value }));
