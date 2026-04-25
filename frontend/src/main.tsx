import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { StrictMode } from "react";

import "./index.css";
import App from "./App";
import { ApiClientProvider } from "./providers/api-client";
import { clerkPublishableKey } from "./providers/clerk";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      signInForceRedirectUrl="/learn"
      signUpForceRedirectUrl="/learn"
      afterSignOutUrl="/learn"
    >
      <ApiClientProvider>
        <App />
      </ApiClientProvider>
    </ClerkProvider>
  </StrictMode>
);
