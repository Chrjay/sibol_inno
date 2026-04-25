import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { adminAuth } from "../firebase-admin";

export interface FirebaseUser {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: FirebaseUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: FirebaseUser | null = null;

  try {
    const authHeader = opts.req.headers["authorization"];
    if (authHeader?.startsWith("Bearer ")) {
      const idToken = authHeader.slice(7);
      const decoded = await adminAuth.verifyIdToken(idToken);
      user = {
        uid: decoded.uid,
        email: decoded.email ?? null,
        name: decoded.name ?? null,
        picture: decoded.picture ?? null,
      };
    }
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
