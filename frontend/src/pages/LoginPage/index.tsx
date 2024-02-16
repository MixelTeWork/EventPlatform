import styles from "./styles.module.css"
import vk from "./vk.png"
import Layout from "../../components/Layout";
import { useTitle } from "../../utils/useTtile";
import { Link } from "react-router-dom";
import classNames from "../../utils/classNames";
import { authLink } from "../../utils/authLink";

export default function LoginPage()
{
	useTitle("Авторизация");

	return (
		<Layout header={null} centered centeredPage gap="2em">
			<Link to="/" className={classNames(styles.back, "material_symbols")}>arrow_back</Link>
			<Link to="/auth" className={styles.auth} />
			<h1>Underparty</h1>
			<a className={styles.login} href={authLink}>
				<span>Войти через</span>
				<img src={vk} alt="VK" />
			</a>
		</Layout>
	);
}
