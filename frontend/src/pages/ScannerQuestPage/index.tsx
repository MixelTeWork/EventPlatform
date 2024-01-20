import { useEffect } from "react";
import Layout from "../../components/Layout"
import useScanner from "../../utils/useScanner";
import styles from "./styles.module.css"

export default function ScannerQuestPage()
{
	const { scanned, scanner } = useScanner();

	useEffect(() =>
	{
		console.log(scanned);
	}, [scanned])

	return (
		<Layout>
			{scanner}
		</Layout>
	);
}
