import clsx from "@/utils/clsx";
import styles from "./layout.module.css"
import type { Viewport } from "next";
import LayoutInner from "./layout_inner";
import Header from "@sCmps/Header";


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
		<div className={styles.root}>
			<Header dev />
			<style>{`body { background: #1e1e1e; }`}</style>
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
