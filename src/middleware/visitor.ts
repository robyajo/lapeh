import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { redis, useRedis } from "../redis";

type DayMemoryStats = {
  requests: number;
  newVisitors: number;
  visitors: Set<string>;
  newVisitorsMobile: number;
  visitorsMobile: Set<string>;
  ipAddresses: number;
  ipSet: Set<string>;
  sessions: number;
  sessionSet: Set<string>;
};

const memoryStats = new Map<string, DayMemoryStats>();
const globalVisitors = new Set<string>();

function formatDateKey(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function parseCookies(header: string | undefined) {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  const parts = header.split(";");
  for (const part of parts) {
    const [k, v] = part.split("=").map((s) => s.trim());
    if (k && v) cookies[k] = decodeURIComponent(v);
  }
  return cookies;
}

function isMobileUserAgent(ua: string | undefined) {
  if (!ua) return false;
  return /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
}

export async function visitorCounter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const now = new Date();
  const dateKey = formatDateKey(now);
  const ip =
    req.ip ||
    (req.headers["x-forwarded-for"] as string | undefined) ||
    req.socket.remoteAddress ||
    "";
  const userAgent = req.headers["user-agent"] as string | undefined;
  const mobile = isMobileUserAgent(userAgent);

  const cookies = parseCookies(req.headers.cookie);
  let visitorId = cookies["visitor_id"];
  if (!visitorId) {
    visitorId = uuidv4();
    res.cookie("visitor_id", visitorId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
  }

  let sessionId = cookies["visitor_session_id"];
  if (!sessionId) {
    sessionId = uuidv4();
    res.cookie("visitor_session_id", sessionId, {
      httpOnly: true,
      sameSite: "lax",
    });
  }

  if (useRedis && redis) {
    const base = dateKey;
    const kRequests = `requests-${base}`;
    const kNewVisitors = `new-visitors-${base}`;
    const kVisitors = `visitors-${base}`;
    const kNewVisitorsMobile = `new-visitors-from-mobile-${base}`;
    const kVisitorsMobile = `visitors-from-mobile-${base}`;
    const kIpAddresses = `ip-addresses-${base}`;
    const kSessions = `sessions-${base}`;
    const kVisitorsSet = `visitors-set-${base}`;
    const kVisitorsMobileSet = `visitors-from-mobile-set-${base}`;
    const kIpSet = `ip-addresses-set-${base}`;
    const kSessionsSet = `sessions-set-${base}`;
    const kVisitorsAll = `visitors-all`;

    try {
      await redis.incr(kRequests);

      const isNewEver = await redis.sadd(kVisitorsAll, visitorId);
      if (isNewEver === 1) {
        await redis.incr(kNewVisitors);
      }

      const addedVisitor = await redis.sadd(kVisitorsSet, visitorId);
      if (addedVisitor === 1) {
        await redis.incr(kVisitors);
      }

      if (mobile) {
        const addedMobileVisitor = await redis.sadd(
          kVisitorsMobileSet,
          visitorId
        );
        if (addedMobileVisitor === 1) {
          await redis.incr(kVisitorsMobile);
        }
        if (isNewEver === 1) {
          await redis.incr(kNewVisitorsMobile);
        }
      }

      if (ip) {
        const addedIp = await redis.sadd(kIpSet, ip);
        if (addedIp === 1) {
          await redis.incr(kIpAddresses);
        }
      }

      const addedSession = await redis.sadd(kSessionsSet, sessionId);
      if (addedSession === 1) {
        await redis.incr(kSessions);
      }
    } catch {
    }
  } else {
    let stats = memoryStats.get(dateKey);
    if (!stats) {
      stats = {
        requests: 0,
        newVisitors: 0,
        visitors: new Set<string>(),
        newVisitorsMobile: 0,
        visitorsMobile: new Set<string>(),
        ipAddresses: 0,
        ipSet: new Set<string>(),
        sessions: 0,
        sessionSet: new Set<string>(),
      };
      memoryStats.set(dateKey, stats);
    }

    stats.requests += 1;

    if (!globalVisitors.has(visitorId)) {
      globalVisitors.add(visitorId);
      stats.newVisitors += 1;
      if (mobile) {
        stats.newVisitorsMobile += 1;
      }
    }

    if (!stats.visitors.has(visitorId)) {
      stats.visitors.add(visitorId);
    }

    if (mobile && !stats.visitorsMobile.has(visitorId)) {
      stats.visitorsMobile.add(visitorId);
    }

    if (ip && !stats.ipSet.has(ip)) {
      stats.ipSet.add(ip);
      stats.ipAddresses += 1;
    }

    if (!stats.sessionSet.has(sessionId)) {
      stats.sessionSet.add(sessionId);
      stats.sessions += 1;
    }
  }

  next();
}

