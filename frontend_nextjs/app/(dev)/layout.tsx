import "./globals.css";
import type { Viewport } from "next";


export const viewport: Viewport = {
	themeColor: "#1e1e1e",
}

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>)
{
	return (
		<>
			<style>{`body { background: #1e1e1e; }`}</style>
			{children}
		</>
	);
}
