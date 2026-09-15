import { login, logout, requireAdmin } from '@/lib/booking/auth';
import { bookings, coupons, rates, settings } from '@/lib/booking/db';
import { changeStatus, saveConfiguration } from '@/lib/booking/service';
import { body, errorResponse, json, sameOrigin } from '@/lib/booking/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    await requireAdmin();
    const [allBookings, config, allRates, allCoupons] = await Promise.all([bookings(), settings(), rates(), coupons()]);
    return json({ bookings: allBookings, settings: config, rates: allRates, coupons: allCoupons });
  }
  catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const data = await body(request);
    if (data.action === 'login') { await login(data.password); return json({ authenticated: true }); }
    await requireAdmin();
    if (data.action === 'logout') await logout();
    else if (data.action === 'status') await changeStatus(data.id, data.status, data.payment, data.received);
    else await saveConfiguration(data);
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
