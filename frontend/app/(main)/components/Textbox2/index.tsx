import styles from "./styles.module.css"
import clsx from "@/utils/clsx";

export default function Textbox2({ children, btn = false, small = false, highlight = false, primary = false, alterbg = false, darkbg = false, style, style2, className }: {
	highlight?: boolean;
	primary?: boolean;
	btn?: boolean;
	small?: boolean;
	alterbg?: boolean;
	darkbg?: boolean;
	className?: string;
	style?: React.CSSProperties;
	style2?: React.CSSProperties;
} & React.PropsWithChildren)
{
	return (
		<div className={
			clsx(styles.root,
				small && styles.small,
				btn && styles.btn,
				highlight && styles.highlight,
				primary && styles.primary,
				alterbg && styles.alterbg,
				darkbg && styles.darkbg,
				className)} style={style}>
			<div></div>
			<div></div>
			<div style={style2}>{children}</div>
		</div>
	);
}
