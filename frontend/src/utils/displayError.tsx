import { ReactNode } from "react";
import { UseMutationResult, UseQueryResult } from "react-query";
import { ApiError } from "../api/dataTypes";

export function formatError(error: any, messageFormater?: (error: string) => string)
{
	const err = error instanceof ApiError ? error.message : "Ошибка";
	const msg = messageFormater ? messageFormater(err) : err;
	return msg
}

export default function displayError(requestRes: UseMutationResult<any, any, any, any> | UseQueryResult<any, any>, render?: (error: string) => ReactNode, messageFormater?: (error: string) => string)
{
	if (!requestRes.isError) return null;

	const msg = formatError(requestRes, messageFormater);
	const renderer = render || defaultRender;
	return renderer(msg);
}

function defaultRender(error: string)
{
	return (
		<h3 style={{ color: "tomato", textAlign: "center" }}>{error}</h3>
	)
}
