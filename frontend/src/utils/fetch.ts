export function fetchPost(input: RequestInfo | URL, body?: any)
{
	return fetch(input, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: body === undefined ? null : JSON.stringify(body),
	});
}

export function fetchDelete(input: RequestInfo | URL)
{
	return fetch(input, {
		method: "DELETE",
	});
}
