// askes-ai/app/_component/DermiChatButton.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Agent, aiAgents } from '@/lib/agents';
import { Loader2 } from 'lucide-react';

export const DermiChatButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { getToken } = useAuth();
  
  const handleDirectChat = async () => {
    setLoading(true);
    const dermiAgent = aiAgents.find(a => a.id === 2); // Find Dr. Dermi

    if (!dermiAgent) {
      alert("Agen Dr. Dermi tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      const response = await axios.post('/dashboard/api/create-session', {
        selectedAgent: dermiAgent,
        notes: "Direct chat with Dr. Dermi",
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { sessionId } = response.data;
      if (sessionId) {
        router.push(`/chat/${sessionId}`);
      }
    } catch (error) {
      console.error("Failed to create session for Dr. Dermi:", error);
      alert("Gagal memulai sesi chat. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleDirectChat} disabled={loading} variant="secondary">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Memulai...
        </>
      ) : (
        "Bypass: Chat dengan Dr. Dermi"
      )}
    </Button>
  );
};
