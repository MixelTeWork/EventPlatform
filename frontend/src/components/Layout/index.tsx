import classNames from "../../utils/classNames";
import Header from "../Header";
import styles from "./styles.module.css"

export default function Layout({ children, className, headerColor, homeBtn = false, styles: el_styles, centered = false, centeredPage = false, height100 = false, gap = 0, header, footer }: LayoutProps)
{
	if (header === undefined) header = <Header color={headerColor} homeBtn={homeBtn} />

	return (
		<div className={classNames(styles.root, !!footer && styles.hasFooter)} style={{ ...el_styles, maxHeight: height100 ? "100dvh" : "" }}>
			{header || <div></div>}
			<div
				className={classNames(
					styles.body, className,
					centered && styles.body_centered,
					centeredPage && styles.body_centeredPage,
				)}
				style={{ gap, maxHeight: height100 ? "100%" : "" }}
			>
				{children}
			</div>
			{footer}
		</div>
	);
}

interface LayoutProps extends React.PropsWithChildren
{
	centeredPage?: boolean,
	centered?: boolean,
	height100?: boolean,
	gap?: number | string,
	className?: string,
	header?: React.ReactNode,
	footer?: React.ReactNode,
	styles?: React.CSSProperties,

	headerColor?: string,
	homeBtn?: boolean
}
