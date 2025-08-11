"use client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react";

export default function ReactQueryProvider({ children }: React.PropsWithChildren)
{
	const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, gcTime: Infinity, retry: 1, retryDelay: 1000 } } }));

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
