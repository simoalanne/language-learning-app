import { useAuth } from "@clerk/react";
import { ApiClient } from "@contract-first-api/api-client";
import createAdapter from "@contract-first-api/react-query";
import { contracts } from "@language-learning-app/contracts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext } from "react";

const apiClient = new ApiClient({
	contracts,
	baseUrl: "/api",
});

const queryClient = new QueryClient();

const api = createAdapter(apiClient.api, queryClient);

type ApiClientContextValue = {
	api: typeof api;
};

const ApiClientContext = createContext<ApiClientContextValue | null>(null);

export const ApiClientProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { getToken } = useAuth();

	apiClient.setHeaders(async () => {
		const token = await getToken();

		if (!token) {
			return {};
		}

		return {
			Authorization: `Bearer ${token}`,
		};
	});

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
