import type { Metadata } from 'next';
// /experiencia is the same átrio as "/"; the homepage is the canonical address.
export const metadata: Metadata = { alternates: { canonical: '/' } };
export default function LobbyPage() { return null; }
