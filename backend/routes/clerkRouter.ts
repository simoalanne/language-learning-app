import express from "express";

import { handleClerkWebhook } from "../webhooks/clerkWebhook.ts";

const clerkRouter = express.Router();

clerkRouter.post(
  "/webhooks",
  express.raw({ type: "application/json" }),
  handleClerkWebhook,
);

export default clerkRouter;
