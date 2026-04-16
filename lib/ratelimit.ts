// In-memory rate limiter - no external service needed
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetIn: windowMs };
  }

  if (record.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetAt - now,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    resetIn: record.resetAt - now,
  };
}

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  attempts.forEach((value, key) => {
    if (now > value.resetAt) attempts.delete(key);
  });
}, 10 * 60 * 1000);
