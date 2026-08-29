import { useAuth } from "@clerk/react";
import { type AppContracts, contracts } from "@language-learning-app/contracts";
import {
	createTanstackQueryHelpers,
	type StrictTanstackQueryHelpersFor,
} from "@rest-rpc/tanstack-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";

const queryClient = new QueryClient();
const apiBaseUrl =
	import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl) {
	throw new Error("VITE_API_BASE_URL environment variable is not set");
}

type Api = StrictTanstackQueryHelpersFor<AppContracts>;

type ApiClientContextValue = {
	api: Api;
};

const ApiClientContext = createContext<ApiClientContextValue | null>(null);

export const ApiClientProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { getToken } = useAuth();

	const api = useMemo(
		() =>
			createTanstackQueryHelpers(contracts, {
				baseUrl: apiBaseUrl,
				strictStatusCodes: true,
				getGlobalHeaders: async () => {
					const token = await getToken();
					const headers: Record<string, string> = {};

					if (token) {
						headers.Authorization = `Bearer ${token}`;
					}

					return headers;
				},
			}),
		[getToken],
	);

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
