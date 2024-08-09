import styles from "./styles.module.css"
import logo from "./logo.png";
import btn from "./btn.png";
import { Link } from "react-router-dom";
import AuthByTicket from "../../components/AuthByTicket";
import useStateBool from "../../utils/useStateBool";

export default function IndexPage()
{
	const authOpen = useStateBool(false);

	return (
		<div className={styles.root}>
			<Link to="/auth" className={styles.auth} />
			<div></div>
			<img className={styles.logo} src={logo} alt="Инди кон" />
			<button className={styles.btn} onClick={authOpen.setT}>
				<img src={btn} alt="Вход" />
			</button>
			<AuthByTicket open={authOpen.v} />
		</div>
	);
}
