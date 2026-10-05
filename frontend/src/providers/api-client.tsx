import { useAuth } from "@clerk/react";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppRouter } from "backend/router";
import { createContext, useContext, useMemo } from "react";

const queryClient = new QueryClient();
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
	throw new Error("VITE_API_BASE_URL environment variable is not set");
}

const createApi = (getToken: () => Promise<string | null>) => {
	const link = new RPCLink({
		origin: apiBaseUrl,
		url: "/rpc",
		headers: async (): Promise<Record<string, string>> => {
			const token = await getToken();
			return token ? { authorization: `Bearer ${token}` } : {};
		},
	});
	const client: RouterClient<AppRouter> = createORPCClient(link);
	return createTanstackQueryUtils(client);
};

type ApiClientContextValue = {
	api: ReturnType<typeof createApi>;
};

const ApiClientContext = createContext<ApiClientContextValue | null>(null);

export const ApiClientProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { getToken } = useAuth();

	const api = useMemo(() => createApi(getToken), [getToken]);

	return (
		<QueryClientProvider client={queryClient}>
			<ApiClientContext.Provider value={{ api }}>
				{children}
			</ApiClientContext.Provider>
		</QueryClientProvider>
	);
};

export const useApiClient = () => {
	const context = useContext(ApiClientContext);

	if (!context) {
		throw new Error("useApiClient must be used within an ApiClientProvider");
	}

	return context;
};
