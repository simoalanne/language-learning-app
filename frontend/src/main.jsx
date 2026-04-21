import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { StrictMode } from "react";

import "./index.css";
import App from "./App.jsx";
import { clerkPublishableKey } from "./Authorisation/clerk";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      signInForceRedirectUrl="/learn"
      signUpForceRedirectUrl="/learn"
      afterSignOutUrl="/learn"
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
