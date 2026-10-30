import { Client, Account, TablesDB, Databases, Storage, Users, Models } from "node-appwrite";
import { cookies } from "next/headers";
import { APPWRITE_CONFIG, isAppwriteConfigured, isAppwriteAdminConfigured } from "./config";

export interface SessionContext {
  client: Client;
  account: Account;
  tablesDB: TablesDB;
  databases: Databases;
  storage: Storage;
}

export interface AdminContext {
  client: Client;
  account: Account;
  tablesDB: TablesDB;
  databases: Databases;
  storage: Storage;
  users: Users;
}

/**
 * Creates an Appwrite Client authenticated with the end-user's session from HTTP-only cookies
 */
export async function createSessionClient(): Promise<SessionContext | null> {
  if (!isAppwriteConfigured()) {
    return null;
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(APPWRITE_CONFIG.sessionCookieName);

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId)
    .setSession(sessionCookie.value);

  return {
    client,
    account: new Account(client),
    tablesDB: new TablesDB(client),
    databases: new Databases(client),
    storage: new Storage(client),
  };
}

/**
 * Creates an Appwrite Client with administrative privileges using the server-side API Key
 */
export function createAdminClient(): AdminContext | null {
  if (!isAppwriteAdminConfigured()) {
    return null;
  }

  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId)
    .setKey(APPWRITE_CONFIG.apiKey);

  return {
    client,
    account: new Account(client),
    tablesDB: new TablesDB(client),
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client),
  };
}

/**
 * Retrieves the currently logged-in user profile from Appwrite Account API
 */
export async function getAuthenticatedUser(): Promise<Models.User<Models.Preferences> | null> {
  const session = await createSessionClient();
  if (!session) return null;

  try {
    const user = await session.account.get();
    return user;
  } catch {
    return null;
  }
}

/**
 * Sets the Appwrite session secret in an HTTP-only secure cookie
 */
export async function setSessionCookie(secret: string, expiresAt?: string): Promise<void> {
  const cookieStore = await cookies();
  const expires = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

  cookieStore.set(APPWRITE_CONFIG.sessionCookieName, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

/**
 * Clears the session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(APPWRITE_CONFIG.sessionCookieName);
}
