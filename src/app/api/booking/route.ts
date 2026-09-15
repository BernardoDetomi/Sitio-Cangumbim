import { settings } from '@/lib/booking/db';
import { airbnbDates, assertAvailable } from '@/lib/booking/calendar';
import { calculateQuote, createRequest } from '@/lib/booking/service';
import { body, errorResponse, json, sameOrigin } from '@/lib/booking/http';
import { throttle } from '@/lib/booking/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const { enabled, maxGuests, privacyUrl } = await settings();
    return json({ enabled, maxGuests, privacyUrl });
  } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const data = await body(request);
    if (data.action === 'quote') {
      const quote = await calculateQuote(data.checkIn, data.checkOut, data.coupon);
      await assertAvailable(data.checkIn, data.checkOut, await airbnbDates());
      return json(quote);
    }
    await throttle('public-requests', 100, 3600);
    return json(await createRequest(data), 201);
  } catch (error) { return errorResponse(error); }
}
