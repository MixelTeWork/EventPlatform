import styles from "./styles.module.css"
import city from "./city.png";
import { Link } from "react-router-dom";
import { authLink } from "../../utils/authLink";

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
			<a className={styles.btn} href={authLink}>
				Вход
			</a>
		</div>
	);
}
