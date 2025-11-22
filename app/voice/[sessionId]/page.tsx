// askes-ai/app/voice/[sessionId]/page.tsx
"use client";

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Vapi from '@vapi-ai/web';
import { aiAgents, Agent } from '@/lib/agents'; // Keep for fallback or direct agent lookups
import Image from 'next/image';
import { PhoneOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios'; // Import axios for fetching session data

// Define Message interface for conversation history
interface VoiceMessage {
  type: 'user' | 'assistant';
  text: string;
}

// Initialize Vapi with the public key from environment variables
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_API_KEY!);

export default function VoiceChatPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = params;
  const [callStatus, setCallStatus] = useState<'inactive' | 'connecting' | 'active' | 'ending'>('inactive');
  const [currentTranscript, setCurrentTranscript] = useState(''); // For partial transcript
  const [conversationHistory, setConversationHistory] = useState<VoiceMessage[]>([]); // For full conversation
  const [isSpeaking, setIsSpeaking] = useState(false); // Renamed from isTalking to be more precise
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const router = useRouter();

  const vapiStartedRef = useRef(false); // To prevent multiple Vapi.start() calls

  useEffect(() => {
    // Fetch session details based on sessionId
    const fetchSessionDetails = async () => {
      try {
        const response = await axios.get(`/dashboard/api/session/${sessionId}`); 
        const sessionData = response.data;
        if (sessionData && sessionData.selectedDoctor) {
            setCurrentAgent(sessionData.selectedDoctor);
        } else {
            console.error("Session data or selectedDoctor not found.");
            router.push('/'); 
        }
      } catch (error) {
        console.error("Failed to fetch session details:", error);
        router.push('/'); // Redirect to dashboard on error
      }
    };

    if (sessionId && !currentAgent) {
      fetchSessionDetails();
    }

    // Define Vapi event listeners
    const onCallStart = () => {
      setCallStatus('active');
      vapiStartedRef.current = true;
    };

    const onCallEnd = async () => {
      setCallStatus('ending'); // Set status to ending
      // Trigger report generation for the voice call
      console.log(`Voice call ended for session: ${sessionId}. Generating report...`);
      try {
        await axios.post('/api/generate-report', { sessionId, conversation: conversationHistory });
        console.log("Report generation initiated for voice call.");
      } catch (error) {
        console.error("Error generating report for voice call:", error);
        alert("Gagal menghasilkan laporan suara. Mohon coba lagi.");
      } finally {
        setCallStatus('inactive'); // Finally set to inactive
        setCurrentTranscript('');
        setConversationHistory([]);
        router.push('/'); // Redirect to dashboard after report generation
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    
    // Accumulate full transcript for report generation
    const onMessage = (message: any) => {
      if (message.type === 'transcript') {
        if (message.transcriptType === 'partial') {
          setCurrentTranscript(message.transcript);
        } else if (message.transcriptType === 'final') {
          setCurrentTranscript(''); // Clear partial once final arrives
          setConversationHistory(prev => [...prev, { type: message.role, text: message.transcript }]);
        }
      }
    };

    // Assign event listeners
    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('message', onMessage);

    // Start Vapi call automatically if agent is loaded and call is inactive
    if (currentAgent && callStatus === 'inactive' && !vapiStartedRef.current) {
        startCall(currentAgent);
    }

    // Cleanup function to remove listeners and end the call if the component unmounts
    return () => {
      vapi.removeAllListeners();
      if (callStatus === 'active' || callStatus === 'connecting') {
        vapi.stop(); // Ensure call is stopped if component unmounts unexpectedly
      }
    };
  }, [sessionId, currentAgent, callStatus, conversationHistory, router]); // Re-run if sessionId or currentAgent changes

  const startCall = (agent: Agent) => {
    setCallStatus('connecting');
    vapi.start({
      model: {
        provider: "gcp",
        model: "gemini-1.5-flash", // Can be gemini-1.5-pro etc.
        messages: [{ role: "system", content: agent.prompt }],
      },
      voice: {
        provider: "eleven-labs",
        voiceId: "josh" // Example voice, can be configured per agent
      }
    });
  };

  const endCall = () => {
    vapi.stop(); // This will trigger 'call-end' event, which handles cleanup and navigation
  };

  if (!currentAgent) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background text-foreground">
        <p>Memuat informasi agen...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <p className="text-lg text-muted-foreground mb-2">
          {callStatus === 'active' ? 'Terhubung dengan' : 'Menghubungkan ke'}
        </p>
        <h1 className="text-3xl font-bold text-primary mb-4">{currentAgent.name}</h1>
        
        <div className="relative w-48 h-48 rounded-full mb-6 overflow-hidden border-4 border-border transition-all duration-300"
             style={{ borderColor: isSpeaking || callStatus === 'connecting' ? 'var(--primary)' : 'var(--border)' }}>
          <Image
            src={currentAgent.image}
            alt={currentAgent.name}
            fill
            style={{ objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; }}
          />
        </div>

        <div className="h-20 flex items-center justify-center min-h-[5rem]">
            {currentTranscript && <p className="text-lg italic text-muted-foreground">{currentTranscript}</p>}
            {conversationHistory.length > 0 && (
                <div className="text-md text-center max-h-[80px] overflow-y-auto w-full">
                    {conversationHistory.slice(-2).map((msg, index) => ( // Show last 2 messages
                        <p key={index} className={`break-words ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                            {msg.type === 'user' ? 'Anda: ' : 'AI: '} {msg.text}
                        </p>
                    ))}
                </div>
            )}
            {!currentTranscript && conversationHistory.length === 0 && (
                <p className="text-xl">...</p>
            )}
        </div>

        <div className="mt-8">
          <Button onClick={endCall} variant="destructive" size="lg" className="rounded-full w-24 h-24">
            <PhoneOff className="h-10 w-10" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          {callStatus === 'connecting' && 'Menghubungkan...'}
          {callStatus === 'ending' && 'Memutuskan...'}
          {callStatus === 'active' && 'Klik untuk mengakhiri panggilan.'}
          {callStatus === 'inactive' && 'Panggilan tidak aktif.'}
        </p>
      </div>
    </div>
  );
}