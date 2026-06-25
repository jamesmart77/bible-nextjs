import { JWTPayload } from "jose";

export interface SessionData extends JWTPayload {
  id: number;
  email: string;
}

export const COOKIE_NAME = "js_session";

export const SESSION_DURATION_DAYS = 180; // 6 months

export const SESSION_EXP_TIME = `${SESSION_DURATION_DAYS}d`;

export const SESSION_MAX_AGE = SESSION_DURATION_DAYS * 24 * 60 * 60; // 6 months in seconds
