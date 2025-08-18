"use client"
import { useEffect } from "react"

export default function ErrorPage({ error, reset }: {
	error: Error & { digest?: string },
	reset: () => void,
})
{
	useEffect(() =>
	{
		(async () =>
		{
			try
			{
				let d = error as unknown;
				if (d instanceof Error) d = { message: d.message, stack: d.stack };
				await fetch("/api/frontend_error", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(d),
				});
			} catch { }
		})()
	}, [error])

	return (
		<div style={{
			background: "linear-gradient(0deg, #00164c, #000613)",
			color: "#b3e0ff",
			width: "100%",
			display: "flex",
			flexDirection: "column",
			gap: "1.5em",
			alignItems: "center",
			justifyContent: "center",
		}}>
			<h2>Кажись, всё поломалось!</h2>
			<button onClick={() => reset()} style={{ color: "blue" }}>
				Перезапустить
			</button>
		</div>
	)
}