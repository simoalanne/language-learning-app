import type { Request, Response } from "express";
import { verifyWebhook } from "@clerk/express/webhooks";

import { deleteClerkUser, upsertClerkUser } from "../database/db.js";

export const handleClerkWebhook = async (req: Request, res: Response) => {
  try {
    const event = await verifyWebhook(req);

    if (event.type === "user.created" || event.type === "user.updated") {
      await upsertClerkUser({
        clerkId: event.data.id,
        email: event.data.email_addresses[0]?.email_address ?? null,
        firstName: event.data.first_name ?? null,
        lastName: event.data.last_name ?? null,
      });

      return res.status(200).json({ received: true });
    }

    if (event.type === "user.deleted") {
      if (event.data.id) {
        await deleteClerkUser(event.data.id);
      }

      return res.status(200).json({ received: true });
    }

    return res.status(200).json({ ignored: true });
  } catch (error) {
    console.error("Clerk webhook verification failed:", error);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }
};
