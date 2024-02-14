import { useMutation } from "react-query";
import { fetchJsonPost } from "../utils/fetch";


export default function useMutationScanner(onSuccess?: (data: ScannerRes) => void, onError?: (err: any) => void)
{
	const mutation = useMutation({
		mutationFn: async (scannerData: ScannerData) =>
			await fetchJsonPost<ScannerRes>("/api/scanner", scannerData),
		onSuccess: onSuccess,
		onError: onError,
	});
	return mutation;
}

interface ScannerData
{

}

interface ScannerRes
{
	res: "ok" | "error",
}