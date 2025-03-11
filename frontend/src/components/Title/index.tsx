import classNames from "../../utils/classNames";
import styles from "./styles.module.css"

export default function Title({ className }: TitleProps)
{
	return (
		<h1 className={classNames(styles.root, className)}>Underparty</h1>
	);
}

interface TitleProps
{
	className?: string;
}
