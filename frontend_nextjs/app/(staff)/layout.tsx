import "./globals.css";
import type { Viewport } from "next";


export const viewport: Viewport = {
	themeColor: "#194659",
}

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>)
{
	return (
		<>
			<style>{`body { background: linear-gradient(0deg, #00093b, #001b3b); }`}</style>
			{children}
		</>
	);
}
