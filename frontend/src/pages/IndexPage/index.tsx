import styles from "./styles.module.css"
import city from "./city.png";
import { Link } from "react-router-dom";

export default function IndexPage()
{
	return (
		<div className={styles.root}>
			<Link to="/auth" className={styles.auth} />
			<div className={styles.title}>
				<img className={styles.img} src={city} alt="Город" />
				<div>
					<h1>Underparty</h1>
					<h2>18.02.24</h2>
				</div>
			</div>
			<a className={styles.btn} href="https://oauth.vk.com/authorize?client_id=51848582&redirect_uri=https://platformevent.pythonanywhere.com/auth_vk&display=page&response_type=code">
				Вход
			</a>
		</div>
	);
}
