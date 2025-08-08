import styles from "./styles.module.css"
import React from "react"
import clsx from "@/utils/clsx"
import type { StateObj } from "@/utils/useStateObj";

export default function Textarea({ className, ref, required, cols, rows, stateObj, onChange, value }: {
	className?: string,
	ref?: React.Ref<HTMLTextAreaElement>,
	required?: boolean,
	cols?: number,
	rows?: number,
	onChange?: React.ChangeEventHandler<HTMLTextAreaElement>,
} & ({
	stateObj?: StateObj<string>,
	value?: never,
} | {
	stateObj?: never,
	value?: string
}))
{
	return (
		<textarea
			className={clsx(styles.root, className)}
			ref={ref}
			required={required}
			cols={cols}
			rows={rows}
			value={value || stateObj?.v}
			onChange={e =>
			{
				stateObj?.set(e.target.value);
				onChange?.(e);
			}}
		/>
	);
}
