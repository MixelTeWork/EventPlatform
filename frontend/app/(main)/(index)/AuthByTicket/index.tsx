import styles from "./styles.module.css"
import avatar from "./avatar.png";
import logo from "./logo.png";
import Image from "next/image";
import QrcodeDecoder from "qrcode-decoder/dist/index";
import clsx from "@/utils/clsx";
import imagefileToData from "@/utils/imagefileToData";
import useStateObj from "@/utils/useStateObj";
import Spinner from "@/components/Spinner";
import { useMutationAuthByTicket } from "@/api/user";
import Title from "@mCmps/Title";
import Textbox2 from "@mCmps/Textbox2";

export default function AuthByTicket({ open }: {
	open: boolean;
})
{
	const error = useStateObj("");
	const mutation = useMutationAuthByTicket(error.set);

	return (
		<div className={clsx(styles.root, open && styles.open)}>
			{mutation.isPending && <Spinner />}
			<div className={styles.body}>
				<Textbox2 className={styles.msgWide}>
					<div className={styles.msg1}>
						<Image src={logo} alt="Инди кон" />
						<span>Загрузка системы...</span>
					</div>
				</Textbox2>
				<Textbox2 className={styles.msg2box}>
					<div className={styles.msg2}>
						<Image src={avatar} alt="Avatar" />
						<h2 className="title">Админ</h2>
						<span>{`Добро пожаловать на Underparty! Для того, чтобы попасть на сайт мероприятия, загрузи свой билет`}</span>
					</div>
				</Textbox2>
				<Textbox2 className={clsx(styles.msg2box, styles.msg_error, error.v && styles.msg_error_open)}>
					<div className={styles.msg2}>
						<Image src={avatar} alt="Avatar" />
						<h2 className="title">Админ</h2>
						<span>В доступе отказано! {error.v}</span>
					</div>
				</Textbox2>
				<Textbox2 className={clsx(styles.msg3, styles.msgWide)} primary>
					<label className={styles.openFile}>
						<Title text="Загрузить билет" small />
						<input
							type="file"
							style={{ display: "none" }}
							accept="image/png, image/jpeg, image/gif"
							disabled={mutation.isPending}
							onChange={async e =>
							{
								error.set("");
								const file = e.target?.files?.[0];
								if (!file) return;
								const imgData = await imagefileToData(file);
								e.target.value = "";
								if (!imgData) return;

								const qr = new QrcodeDecoder();
								const r = await qr.decodeFromImage(imgData.data);
								const code = r?.data;
								if (!code || !code.match(/\d+-\d+-\d+-\d+-\d+/))
								{
									error.set("Изображение не содержит QR-кода или он некорректный.");
									fetch("/api/auth_ticket_err", {
										method: "POST",
										headers: { "Content-Type": "application/json" },
										body: JSON.stringify(code || "")
									})
									return;
								}
								mutation.mutate({ code });
							}}
						/>
					</label>
				</Textbox2>
			</div>
		</div>
	);
}
