import { useRef, useState } from "react";
import styles from "./styles.module.css"
import { useMutationAuth } from "../../api/auth";
import Layout from "../../components/Layout";
import { useTitle } from "../../utils/useTtile";
import { Form, FormField } from "../../components/Form";
import Spinner from "../../components/Spinner";
import { Link } from "react-router-dom";

export default function AuthPage()
{
	useTitle("Авторизация");
	const [error, setError] = useState("");
	const inp_login = useRef<HTMLInputElement>(null);
	const inp_password = useRef<HTMLInputElement>(null);
	const mutation = useMutationAuth(setError);

	function onSubmit()
	{
		const login = inp_login.current?.value || "";
		const password = inp_password.current?.value || "";
		mutation.mutate({ login, password });
	}

	return (
		<Layout header={null} centered centeredPage gap="2em">
			<Link to="/" className={styles.back}></Link>
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
				<button type="submit" className="button button_light button_small" disabled={mutation.status == "loading"}>Войти</button>
			</Form>
		</Layout>
	);
}
