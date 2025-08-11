async function sendErr(getData)
{
	try
	{
		await fetch("/api/frontend_error", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(getData()),
		});
	} catch { }
}
window.addEventListener("error", e => sendErr(() =>
{
	const err = { msg: e.message, filename: e.filename, line: e.lineno, col: e.colno, error: e.error };
	if (err.error instanceof Error) err.error = { message: err.error.message, stack: err.error.stack };
	if (err.error instanceof DOMException) err.error = { message: err.error.message, name: err.error.name };
	return err;
}));
window.addEventListener("unhandledrejection", e => sendErr(() => (
	{ message: e.reason?.message, stack: e.reason?.stack }
)));