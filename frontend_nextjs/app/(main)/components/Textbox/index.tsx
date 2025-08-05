import styles from "./styles.module.css"
import clsx from "@/utils/clsx";

export default function Textbox({ children, btn = false, small = false, highlight = false, className }: TextboxProps)
{
	return (
		<div className={clsx(styles.root, small && styles.small, btn && styles.btn, highlight && styles.highlight, className)}>
			{children}
		</div>
	);
}


interface TextboxProps extends React.PropsWithChildren
{
	highlight?: boolean;
	btn?: boolean;
	small?: boolean;
	className?: string;
}
