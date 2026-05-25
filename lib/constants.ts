import { JWTPayload } from "jose";

export interface SessionData extends JWTPayload {
  id: number;
  email: string;
}

export const COOKIE_NAME = "js_session";

export const SESSION_EXP_TIME = "60d";

export const SESSION_MAX_AGE = 60 * 24 * 60 * 60; // 60 days in seconds