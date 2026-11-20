import { RouteError, route } from "@rest-rpc/server";
import { eq } from "drizzle-orm";
import { clerkClient } from "./clerk.ts";
import * as schema from "./drizzle/schema.ts";

export const upsertClerkUser = async ({
	db,
	clerkId,
	email,
	firstName,
	lastName,
}: {
	db: typeof import("./drizzle/db.ts").default;
	clerkId: string;
	email: string | null;
	firstName: string | null;
	lastName: string | null;
}) => {
	const [user] = await db
		.insert(schema.users)
		.values({
			clerk_id: clerkId,
			email,
			first_name: firstName,
			last_name: lastName,
		})
		.onConflictDoUpdate({
			target: schema.users.clerk_id,
			set: {
				email,
				first_name: firstName,
				last_name: lastName,
			},
		})
		.returning();

	return user;
};

declare module "@rest-rpc/server" {
	interface DefaultContext {
		db: typeof import("./drizzle/db.ts").default;
		request: Request;
	}
}

const requireAuth = route.middleware(async ({ context, next }) => {
	const requestState = await clerkClient.authenticateRequest(context.request, {
		authorizedParties: process.env.APP_ORIGIN
			? [process.env.APP_ORIGIN]
			: undefined,
	});
	const userId = requestState.toAuth()?.userId;

	if (!requestState.isAuthenticated || !userId) {
		throw new RouteError("UNAUTHORIZED");
	}

	const [userInDb] = await context.db
		.select()
		.from(schema.users)
		.where(eq(schema.users.clerk_id, userId));

	if (!userInDb) {
		const clerkUser = await clerkClient.users.getUser(userId);
		await upsertClerkUser({
			db: context.db,
			clerkId: clerkUser.id,
			email: clerkUser.emailAddresses[0].emailAddress,
			firstName: clerkUser.firstName,
			lastName: clerkUser.lastName,
		});
	}

	return next({ context: { clerkId: userId } });
});

export const base = route;
export const authed = route.use(requireAuth);
