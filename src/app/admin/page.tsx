import type { Metadata } from 'next';
import { AdminPanel } from '@/components/reservations/AdminPanel';
export const metadata: Metadata = { title: 'Administração | Sítio Cangumbim', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default function AdminPage() { return <AdminPanel />; }
