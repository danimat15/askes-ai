// askes-ai/app/_component/InteractionChoiceDialog.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Agent } from '@/lib/agents';
import { MessageSquare, Phone } from 'lucide-react';
import { useAuth } from '@clerk/nextjs'; // Import useAuth

interface InteractionChoiceDialogProps {
  agent: Agent;
  notes?: string; // Optional notes from symptom input
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InteractionChoiceDialog = ({ agent, notes = "Direct selection", isOpen, onOpenChange }: InteractionChoiceDialogProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { getToken } = useAuth(); // Get token function

  const handleInteractionChoice = async (choice: 'chat' | 'voice') => {
    setLoading(true);
    console.log("Attempting to create session with agent:", agent.id, "and notes:", notes);
    try {
      const token = await getToken(); // Get auth token
      const response = await axios.post('/dashboard/api/create-session', {
        selectedAgent: agent,
        notes: notes,
      }, {
        headers: { Authorization: `Bearer ${token}` } // Pass token
      });

      console.log("'/dashboard/api/create-session' response:", response.data);
      const { sessionId } = response.data;

      if (!sessionId) {
        throw new Error('Failed to get session ID from API response.');
      }

      console.log(`Session created: ${sessionId}. Navigating to /${choice}/${sessionId}`);
      onOpenChange(false); // Close the dialog

      if (choice === 'chat') {
          router.push(`/chat/${sessionId}`);
      } else {
          router.push(`/voice/${sessionId}`);
      }
    } catch (error) {
      console.error("Error creating session in InteractionChoiceDialog:", error);
      if (axios.isAxiosError(error)) {
        console.error("API Error Response Data:", error.response?.data);
      }
      alert("Gagal membuat sesi konsultasi. Silakan periksa console untuk detail.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pilih Mode Konsultasi</DialogTitle>
          <DialogDescription>
            Bagaimana Anda ingin melanjutkan konsultasi dengan {agent.name}?
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
        {loading && <p className="text-center text-sm text-muted-foreground">Membuat sesi...</p>}
      </DialogContent>
    </Dialog>
  );
};
