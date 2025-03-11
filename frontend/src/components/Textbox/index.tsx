import classNames from "../../utils/classNames";
import styles from "./styles.module.css"

export default function Textbox({ children, btn = false, type2 = false, small = false, dark = false, highlight = false, className }: TextboxProps)
{
	return (
		<div className={classNames(styles.root, small && styles.small, btn && styles.btn, highlight && styles.highlight, className)}>
			{children}
		</div>
	);
}


interface TextboxProps extends React.PropsWithChildren
{
	highlight?: boolean;
	btn?: boolean;
	small?: boolean;
	dark?: boolean;
	type2?: boolean;
	className?: string;
}
