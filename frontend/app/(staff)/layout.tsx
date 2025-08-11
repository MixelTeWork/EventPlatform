import styles from "./layout.module.css"
import type { Viewport } from "next";
import Header from "@sCmps/Header";
import clsx from "@/utils/clsx";
import LayoutInner from "./layout_inner";


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
		<div className={styles.root}>
			<Header />
			<style>{`body { background: linear-gradient(0deg, #00093b, #001b3b); }`}</style>
			<div className={clsx(styles.bodyContainer, "simplePopup")}>
				<div className={styles.body}>
					<LayoutInner>
						{children}
					</LayoutInner>
				</div>
			</div>
		</div>
	);
}
