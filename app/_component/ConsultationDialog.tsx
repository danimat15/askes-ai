// askes-ai/app/_component/ConsultationDialog.tsx
"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Agent, aiAgents } from '@/lib/agents';
import { MessageSquare, Phone, Loader2 } from 'lucide-react';

export const ConsultationDialog = () => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { getToken } = useAuth();
  
  // Hardcode Dr. Meta (Dokter Umum) for the bypass
  const agent = aiAgents.find(a => a.id === 1)!;

  const handleInteractionChoice = async (choice: 'chat' | 'voice') => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.post('/dashboard/api/create-session', {
        selectedAgent: agent,
        notes: "Direct consultation bypass", // Use a placeholder note
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { sessionId } = response.data;
      if (sessionId) {
        setIsOpen(false); // Close dialog
        if (choice === 'chat') {
          router.push(`/chat/${sessionId}`);
        } else {
          router.push(`/voice/${sessionId}`);
        }
      }
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Gagal memulai sesi konsultasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>+ Mulai Konsultasi</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pilih Mode Konsultasi</DialogTitle>
          <DialogDescription>
            Anda akan memulai konsultasi dengan {agent.name}. Silakan pilih mode interaksi.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-24 flex flex-col gap-2" 
            onClick={() => handleInteractionChoice('chat')}
            disabled={loading}
          >
            <MessageSquare />
            <span>Chat Teks & Foto</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex flex-col gap-2" 
            onClick={() => handleInteractionChoice('voice')}
            disabled={loading}
          >
            <Phone />
            <span>Percakapan Suara</span>
          </Button>
        </div>
        {loading && (
            <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Membuat sesi...
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
