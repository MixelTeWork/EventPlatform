import type { Metadata, Viewport } from "next";
import localFont from "next/font/local"
import "./globals.css";
import clsx from "@/utils/clsx";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import UserLoader from "@/components/UserLoader";
import MessageFromBackend from "@/components/MessageFromBackend";

const font_PTSans = localFont({
	src: [
		{ path: "../fonts/PT_Sans/PTSans-Regular.ttf", weight: "400", style: "normal", },
		{ path: "../fonts/PT_Sans/PTSans-Italic.ttf", weight: "400", style: "italic", },
		{ path: "../fonts/PT_Sans/PTSans-Bold.ttf", weight: "700", style: "normal", },
		{ path: "../fonts/PT_Sans/PTSans-BoldItalic.ttf", weight: "700", style: "italic", },
	],
	variable: "--font-PTSans",
});

const font_ZeroCool = localFont({ src: "../fonts/ZeroCool.ttf", variable: "--font-ZeroCool", fallback: ["var(--font-PTSans)"], adjustFontFallback: false });
const font_MFFRBL = localFont({ src: "../fonts/monsterfriendforerusbylya.otf", variable: "--font-MFFRBL", fallback: ["var(--font-PTSans)"], adjustFontFallback: false });

const url = new URL(process.env.PUBLIC_URL || "");
export const metadata: Metadata = {
	metadataBase: url,
	title: "Underparty: Multiverse",
	description: "Underparty: Multiverse",
	openGraph: {
		url: url,
	},
};

export const viewport: Viewport = {
	themeColor: "#00042b",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>)
{
	return (
		<html lang="en">
			<body className={clsx(font_PTSans.variable, font_ZeroCool.variable, font_MFFRBL.variable)}>
				<MessageFromBackend />
				<ReactQueryProvider>
					<UserLoader />
					{children}
				</ReactQueryProvider>
			</body>
		</html>
	);
}
