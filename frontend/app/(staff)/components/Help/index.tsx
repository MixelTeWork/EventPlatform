import React from "react"
import styles from "./styles.module.css"

export default function Help({ text }: { text: string })
{
	return (
		<span className={styles.root}>
			<span>?</span>
			<span><span>{text}</span></span>
		</span>
	);
}
