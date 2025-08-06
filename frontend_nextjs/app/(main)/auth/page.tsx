"use client"
import styles from "./page.module.css"
import { useRef, useState } from "react";
// import { useMutationAuth } from "../../api/auth";
import Link from "next/link";
import Spinner from "@/components/Spinner";
import { Form, FormField } from "@/components/Form";
import { useTitle } from "@/utils/useTtile";

export default function AuthPage()
{
	useTitle("Авторизация");
	const [error, setError] = useState("");
	const inp_login = useRef<HTMLInputElement>(null);
	const inp_password = useRef<HTMLInputElement>(null);
	// const mutation = useMutationAuth(setError);
	const mutation = {
		isLoading: false,
		mutate: (obj: any) => { setError(""); throw new Error("Not Implemented") },
	}
	function onSubmit()
	{
		const login = inp_login.current?.value || "";
		const password = inp_password.current?.value || "";
		mutation.mutate({ login, password });
	}

	return (
		<div className={styles.root}>
			<Link href="/" className={styles.back}></Link>
			<h2>Получено достижение!</h2>
			<h3>Вы не должны были это увидеть</h3>
			{error && <h3>{error}</h3>}
			{mutation.isLoading && <Spinner />}
			<Form className={styles.form} onSubmit={onSubmit}>
				<FormField label="Логин">
					<input ref={inp_login} type="text" name="login" required />
				</FormField>
				<FormField label="Пароль">
					<input ref={inp_password} type="password" name="password" required />
				</FormField>
				<button type="submit" disabled={mutation.isLoading}>Войти</button>
			</Form>
		</div>
	);
}
