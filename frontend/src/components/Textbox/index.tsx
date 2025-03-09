import classNames from "../../utils/classNames";
import styles from "./styles.module.css"

export default function Textbox({ children, type2 = false, small = false, dark = false, highlight = false, className }: TextboxProps)
{
	return (
		<div className={classNames(styles.root, small && styles.small, className)}>
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
