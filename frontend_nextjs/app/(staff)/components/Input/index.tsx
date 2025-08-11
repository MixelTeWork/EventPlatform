import styles from "./styles.module.css"
import React, { type InputHTMLAttributes } from "react"
import clsx from "@/utils/clsx"
import type { StateObj } from "@/utils/useStateObj";

export default function Input<T extends React.HTMLInputTypeAttribute>({ className, ref, required = false, type = "text" as T, stateObj, value, onChange, onChangeV, checked }: {
	className?: string,
	ref?: React.Ref<HTMLInputElement>,
	required?: boolean,
	type?: T,
	onChange?: React.ChangeEventHandler<HTMLInputElement>,
	onChangeV?: (v: T extends "number" ? number : T extends "checkbox" ? boolean : string) => void,
} & ({
	stateObj?: StateObj<T extends "number" ? number : T extends "checkbox" ? boolean : string>,
	value?: never,
	checked?: never,
} | {
	stateObj?: never,
	value?: InputHTMLAttributes<HTMLInputElement>["value"],
	checked?: boolean,
}))
{
	const input = <input
		className={clsx(styles.root, className)}
		ref={ref}
		required={required}
		type={type}
		value={value || (typeof stateObj?.v == "boolean" ? undefined : stateObj?.v)}
		checked={checked || (typeof stateObj?.v == "boolean" ? stateObj?.v : undefined)}
		onChange={e =>
		{
			let value =
				type == "number" ? e.target.valueAsNumber :
					type == "checkbox" ? e.target.checked :
						e.target.value;
			stateObj?.set(value as any);
			onChangeV?.(value as any);
			onChange?.(e);
		}}
	/>

	return type == "checkbox" ?
		<label className={styles.checkbox}>{input}<span></span></label>
		: input;
}
