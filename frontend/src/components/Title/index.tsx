import classNames from "../../utils/classNames";
import styles from "./styles.module.css"

export default function Title({ className, text = "Underparty", small = false }: TitleProps)
{
	return (
		<h1 className={classNames(styles.root, small && styles.small, className)}>{text}</h1>
	);
}

interface TitleProps
{
	text?: string,
	small?: boolean
	className?: string;
}
