import { notFound } from 'next/navigation';
import { findRoom, rooms } from '@/lib/immersive';
export function generateStaticParams() { return rooms.map(room => ({ room: room.id })); }
export default async function RoomPage({ params }: { params: Promise<{ room: string }> }) {
  if (!findRoom((await params).room)) notFound();
  return null;
}
