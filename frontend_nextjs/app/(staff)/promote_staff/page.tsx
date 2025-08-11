"use client"
import useSecuredPage from "@/utils/useSecuredPage";
import PromotePage from "../promote_manager/PromotePage";

export default function Page()
{
	useSecuredPage("promote_staff");

	return <PromotePage role="staff" />
}
