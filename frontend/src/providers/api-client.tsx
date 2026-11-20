import { useAuth } from "@clerk/react";
import { createClient } from "@rest-rpc/core";
import { createTanstackQueryUtils } from "@rest-rpc/tanstack-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import { getApi } from "../contract.ts" with { type: "macro" };

const queryClient = new QueryClient();
export const getBaseClient = (getToken: () => Promise<string | null>) => {
	const client = createClient(getApi(), {
		mountPath: "/api",
		globalHeaders: {
			authorization: async () => {
				const token = await getToken();
				return token ? `Bearer ${token}` : undefined;
			},
		},
	});
	return client;
};

const createApi = (getToken: () => Promise<string | null>) => {
	return createTanstackQueryUtils(getBaseClient(getToken));
};

type ApiClientContextValue = {
	api: ReturnType<typeof createApi>;
	rawApi: ReturnType<typeof getBaseClient>;
};

const ApiClientContext = createContext<ApiClientContextValue | null>(null);

export const ApiClientProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { getToken } = useAuth();
	const rawApi = useMemo(() => getBaseClient(getToken), [getToken]);
	const api = useMemo(() => createApi(getToken), [getToken]);

	return (
		<QueryClientProvider client={queryClient}>
			<ApiClientContext.Provider value={{ api, rawApi }}>
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
