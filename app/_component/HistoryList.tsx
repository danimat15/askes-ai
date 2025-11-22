// askes-ai/app/_component/HistoryList.tsx
"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { ReportDialog } from './ReportDialog';
import { Agent } from '@/lib/agents';

interface ConsultationSession {
  id: number;
  sessionId: string;
  createdBy: string; // Clerk userId
  notes: string;
  selectedDoctor: Agent; // Stored as JSON, but type should be Agent
  conversation: any; // Stored as JSON
  report: any; // Stored as JSON
  createdAt: string; // ISO string
}

export const HistoryList = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth(); // Get token function from Clerk
  const [history, setHistory] = useState<ConsultationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const token = await getToken(); // Get the auth token
        const response = await axios.get('/dashboard/api/history', {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token
          },
        });
        setHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isLoaded, isSignedIn, getToken]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="p-8 border-2 border-dashed border-muted rounded-lg text-center">
        <p className="text-muted-foreground">Anda perlu login untuk melihat riwayat konsultasi.</p>
        <Button onClick={() => router.push('/sign-in')} className="mt-4">Login</Button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-8 border-2 border-dashed border-muted rounded-lg text-center">
        <p className="text-muted-foreground">Belum ada riwayat konsultasi.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Spesialis</TableHead>
          <TableHead>Catatan Awal</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((session) => (
          <TableRow key={session.sessionId}>
            <TableCell className="font-medium">{session.selectedDoctor.specialization}</TableCell>
            <TableCell>{session.notes.substring(0, 50)}...</TableCell>
            <TableCell>{new Date(session.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              {session.report ? (
                <ReportDialog report={session.report} />
              ) : (
                <span className="text-muted-foreground text-sm">Laporan belum tersedia</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
