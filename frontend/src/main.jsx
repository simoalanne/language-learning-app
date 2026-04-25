import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { StrictMode } from "react";

import "./index.css";
import App from "./App.jsx";
import { ApiClientProvider } from "./providers/api-client";
import { clerkPublishableKey } from "./providers/clerk";

createRoot(document.getElementById("root")).render(
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
