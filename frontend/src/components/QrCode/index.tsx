import { useEffect, useState } from "react";
import QRCode from "qrcode"

export default function QrCode({ code, scale = 10, margin = 1, color = "#000000", colorBg = "#ffffff" }: QrCodeProps)
{
	const [qrcode, setQrcode] = useState("");
	useEffect(() =>
	{
		if (!code) return;
		setQrcode("")
		QRCode.toDataURL(code, { errorCorrectionLevel: "H", scale, margin, color: { dark: color, light: colorBg } }, (e, url) => setQrcode(url));
	}, [code, color, scale, margin, colorBg]);

	return (
		<img src={qrcode} alt={code} style={{ width: "100%" }} />
	);
}

interface QrCodeProps
{
	scale?: number
	margin?: number
	code?: string,
	color?: string,
	colorBg?: string,
}
