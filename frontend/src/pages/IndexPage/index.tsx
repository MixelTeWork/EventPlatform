import styles from "./styles.module.css"
import city from "./city.png";
import { Link } from "react-router-dom";
import AuthByTicket from "../../components/AuthByTicket";
import useStateBool from "../../utils/useStateBool";

export default function IndexPage()
{
	const authOpen = useStateBool(false);

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
			<button className={styles.btn} onClick={authOpen.setT}>
				Вход
			</button>
			<AuthByTicket open={authOpen.v} />
		</div>
	);
}
