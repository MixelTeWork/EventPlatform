import styles from "./styles.module.css"
import clsx from "@/utils/clsx";

export default function Textbox({ children, btn = false, small = false, highlight = false, primary = false, alterbg = false, darkbg = false, className }: {
	highlight?: boolean;
	primary?: boolean;
	btn?: boolean;
	small?: boolean;
	alterbg?: boolean;
	darkbg?: boolean;
	className?: string;
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
				className)}>
			{children}
		</div>
	);
}
