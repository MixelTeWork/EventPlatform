import "./globals.css";
import type { Viewport } from "next";


export const viewport: Viewport = {
	themeColor: "#ffdb6c",
}

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>)
{
	return (
		<>
			<style>{`body { background: var(--background, linear-gradient(0deg, #ffe87e, #ffdb6c)); }`}</style>
			{children}
		</>
	);
}
