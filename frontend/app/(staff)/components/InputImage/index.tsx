import styles from "./styles.module.css"
import React from "react"
import type { StateObj } from "@/utils/useStateObj";
import imagefileToData from "@/utils/imagefileToData";
import type { ImgData } from "@/api/dataTypes";
import clsx from "@/utils/clsx";

export default function InputImage({ className, curImg, imgData, width, aspectRatio }: {
	imgData: StateObj<ImgData | null>,
	className?: string,
	curImg?: string,
	width?: string,
	aspectRatio?: string
})
{
	const img = imgData.v?.data || curImg;
	return (
		<label className={clsx(styles.root, className)} style={{ width, aspectRatio }}>
			{img && <img src={img} alt="Картинка" />}
			<input
				type="file"
				style={{ display: "none" }}
				accept="image/png, image/jpeg, image/gif"
				onChange={async e =>
				{
					const file = e.target?.files?.[0];
					if (!file) return;
					imgData.set({ data: "", name: "" });
					imgData.set(await imagefileToData(file));
					e.target.value = "";
				}}
			/>
		</label>
	);
}
