import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@/app/generated/prisma/client";

/**
 * Checks that the current request has a valid session and, optionally,
 * that the logged-in user has one of the allowed roles.
 *
 * Returns the session if authorized, or null if not.
 * Callers are responsible for returning the correct HTTP error response.
 */
export async function getAuthorizedSession(allowedRoles?: Role[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return null;
  }

  return session;
}