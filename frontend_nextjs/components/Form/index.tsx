import styles from "./styles.module.css"
import { useRef } from "react";
import clsx from "@/utils/clsx";

export function Form({ className, style, onSubmit, children }: {
	onSubmit: (data: FormData) => void,
	className?: string,
	style?: React.StyleHTMLAttributes<HTMLFormElement>,
} & React.PropsWithChildren)
{
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<form
			className={clsx(styles.form, className)}
			style={style}
			ref={formRef}
			onSubmit={e =>
			{
				e.preventDefault();
				if (!formRef.current) return;

				const data = new FormData(formRef.current);
				onSubmit(data);
			}}
		>
			{children}
		</form>
	);
}

export function FormField({ label, className, style, label_className, label_style, children }: {
	label?: string,
	className?: string,
	style?: React.StyleHTMLAttributes<HTMLLabelElement>,
	label_className?: string,
	label_style?: React.StyleHTMLAttributes<HTMLSpanElement>,
} & React.PropsWithChildren)
{
	return (
		<label className={clsx(styles.field, className)} style={style}>
			<span className={label_className} style={label_style}>{label}</span>
			{children}
		</label>
	);
}
