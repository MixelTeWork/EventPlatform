import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css"
import avatar from "./avatar.png";
import avatar_monster from "./avatar/avatar_monster.png";
import avatar_human from "./avatar/avatar_human.png";
import avatar_creator from "./avatar/avatar_creator.png";
import avatar_destroyer from "./avatar/avatar_destroyer.png";
import avatar_traveler from "./avatar/avatar_traveler.png";
import avatar_coolman from "./avatar/avatar_coolman.png";
import { useMutationLogout } from "../../api/auth";
import useUser from "../../api/user";
import Spinner from "../Spinner";
import classNames from "../../utils/classNames";
import hasPermission from "../../api/operations";
import IconHome from "../../icons/home";
import SimpleHeader from "./SimpleHeader";
import useStateBool from "../../utils/useStateBool";
import IconExit from "../../icons/exit";
import IconCode from "../../icons/code";
import IconWidgets from "../../icons/widgets";

export default function Header({ homeBtn = false, forStaff = false, forDev = false }: HeaderProps)
{
	const menuOpen = useStateBool(false);
	const navigate = useNavigate();
	const logout = useMutationLogout(menuOpen.setF);
	const user = useUser();

	return (forStaff || forDev) ? <SimpleHeader homeBtn={homeBtn} /> :
		<div className={styles.root}>
			<div className={styles.menu}>
				<Link to={"/"} className={styles.home}>
					{homeBtn && <IconHome />}
				</Link>
				{menuOpen.v && <>
					<button className="clearBtn" onClick={() => logout.mutate()} disabled={logout.status != "idle" && logout.status != "error"}>
						<IconExit />
					</button>
					{hasPermission(user, "page_debug") && <Link to="/debug"><IconCode /></Link>}
					{hasPermission(user, "page_staff") && <Link to="/worker"><IconWidgets /></Link>}
				</>}
			</div>
			<div className={styles.gap}></div>
			<div className={styles.text}>
				<div>{user.data?.name || "Войти ->"}</div>
				<div>{user.data?.balance} М</div>
			</div>
			<button className={classNames(styles.img, "clearBtn")} onClick={() => user.data?.auth ? menuOpen.set(v => !v) : navigate("/")}>
				<img src={TTYPES[user.data?.ticketTId!] || avatar} alt="avatar" />
			</button>
			{logout.status == "loading" && <Spinner />}
		</div>
}

interface HeaderProps
{
	homeBtn?: boolean
	forStaff?: boolean,
	forDev?: boolean,
}

const TTYPES = {
	70: avatar_monster, //"Монстр"
	71: avatar_human, //"Человек"
	72: avatar_coolman, //"Решительный человек"
	73: avatar_traveler, //"Путешественник по вселенным"
	74: avatar_destroyer, //"Разрушитель вселенных"
	75: avatar_creator, //"Создатель"
	90: avatar, //"Спец.Гость"
	91: avatar, //"Маркет"
	92: avatar, //"Участник"
	94: avatar, //"Пресса"
} as { [id: number]: string };
