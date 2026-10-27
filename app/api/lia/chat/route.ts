import { createChatHandler } from '@/lib/lia-proxy';
export const runtime = 'nodejs';
export const maxDuration = 35;
export async function POST(request: Request) {
  return createChatHandler({ apiUrl: process.env.LIA_API_URL, token: process.env.LIA_SERVICE_TOKEN, redisUrl: process.env.LIA_RATE_LIMIT_REDIS_URL, redisToken: process.env.LIA_RATE_LIMIT_REDIS_TOKEN })(request);
}
