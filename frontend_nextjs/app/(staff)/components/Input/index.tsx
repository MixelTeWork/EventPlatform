import styles from "./styles.module.css"
import React, { type InputHTMLAttributes } from "react"
import clsx from "@/utils/clsx"
import type { StateObj } from "@/utils/useStateObj";

export default function Input<T extends React.HTMLInputTypeAttribute>({ className, ref, required = false, type = "text" as T, stateObj, value, onChange }: {
	className?: string,
	ref?: React.Ref<HTMLInputElement>,
	required?: boolean,
	type?: T,
	onChange?: React.ChangeEventHandler<HTMLInputElement>,
} & ({
	stateObj?: StateObj<T extends "number" ? number : string>,
	value?: never,
} | {
	stateObj?: never,
	value?: InputHTMLAttributes<HTMLInputElement>["value"],
}))
{
	return (
		<input
			className={clsx(styles.root, className)}
			ref={ref}
			required={required}
			type={type}
			value={value || stateObj?.v}
			onChange={e =>
			{
				if (stateObj)
				{
					if (type == "number")
						stateObj.set(e.target.valueAsNumber as any);
					else
						stateObj.set(e.target.value as any);
				}
				onChange?.(e);
			}}
		/>
	);
}
