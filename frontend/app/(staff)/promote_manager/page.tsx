"use client"
import useSecuredPage from "@/utils/useSecuredPage";
import PromotePage from "./PromotePage";

export default function Page()
{
	useSecuredPage("promote_manager");

	return <PromotePage role="manager" />
}
