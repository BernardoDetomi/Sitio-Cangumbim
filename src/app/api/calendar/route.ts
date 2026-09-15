import { calendar } from '@/lib/booking/calendar';
import { errorResponse, json } from '@/lib/booking/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() { try { return json(await calendar()); } catch (error) { return errorResponse(error); } }
