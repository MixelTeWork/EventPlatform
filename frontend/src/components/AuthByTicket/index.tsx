import { useMutationAuthByTicket } from "../../api/auth";
import classNames from "../../utils/classNames";
import imagefileToData from "../../utils/imagefileToData";
import useStateObj from "../../utils/useStateObj";
import Spinner from "../Spinner";
import styles from "./styles.module.css"
import logo from "./logo.png";
import avatar from "./avatar.png";
import QrcodeDecoder from "qrcode-decoder/dist/index";

export default function AuthByTicket({ open }: AuthByTicketProps)
{
	const error = useStateObj("");
	const mutation = useMutationAuthByTicket(error.set);

	return (
		<div className={classNames(styles.root, open && styles.open)}>
			{mutation.isLoading && <Spinner />}
			<div className={styles.body}>
				<div className={classNames("textbox", styles.msgWide)}>
					<div></div>
					<div className={styles.msg1}>
						<img src={logo} alt="Инди кон" />
						<span>Загрузка системы...</span>
					</div>
				</div>
				<div className={classNames("textbox2", styles.msg2box)}>
					<div></div>
					<div className={styles.msg2}>
						<img src={avatar} alt="Avatar" />
						<h2 className="title">Админ</h2>
						<span>Добро пожаловать на индикон "пользователь"! Для того, чтобы начать игру, загрузи свой билет</span>
					</div>
				</div>
				<div className={classNames("textbox2", styles.msg2box, styles.msg_error, error.v && styles.msg_error_open)}>
					<div></div>
					<div className={styles.msg2}>
						<img src={avatar} alt="Avatar" />
						<h2 className="title">Админ</h2>
						<span>В доступе отказано! {error.v}</span>
					</div>
				</div>
				<label className={classNames("textbox", styles.msg3, styles.msgWide)}>
					<div></div>
					<span className="textbox_btn"></span>
					<div className={styles.openFile}>
						<div className="title">Загрузить билет</div>
						<input
							type="file"
							style={{ display: "none" }}
							accept="image/png, image/jpeg, image/gif"
							disabled={mutation.isLoading}
							onChange={async e =>
							{
								error.set("");
								const imgData = await imagefileToData(e.target?.files?.[0]!, "")
								e.target.value = "";
								if (!imgData) return;

								const qr = new QrcodeDecoder();
								const r = await qr.decodeFromImage(imgData.data);
								const code = r?.data;
								if (!code || !code.match(/\d+-\d+-\d+-\d+-\d+/))
								{
									error.set("Изображение не содержит QR-кода или он некорректный.");
									return;
								}
								mutation.mutate({ code });
							}}
						/>
					</div>
				</label>
			</div>
		</div>
	);
}

interface AuthByTicketProps
{
	open: boolean;
}
