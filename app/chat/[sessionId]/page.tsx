// askes-ai/app/chat/[sessionId]/page.tsx
"use client"; // This component will be a client component

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter

interface Message {
  role: 'user' | 'model';
  content: string | { type: 'text'; value: string } | { type: 'image'; src: string; alt: string }[];
}

export default function ChatPage({ params }: { params: { sessionId: string } }) { // Accept params
  const { sessionId } = params; // Extract sessionId
  const [prompt, setPrompt] = useState<string>('');
  const [image, setImage] = useState<string | null>(null); // Stores base64 image
  const [conversation, setConversation] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter(); // Initialize useRouter

  // Function to simulate saving/ending chat and navigating back
  const handleEndChat = async () => {
    setLoading(true);
    try {
      // Send conversation to report generation API
      await axios.post('/api/generate-report', { sessionId, conversation });
      console.log(`Report generation initiated for session: ${sessionId}`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Gagal menghasilkan laporan. Mohon coba lagi.');
    } finally {
      setLoading(false);
      router.push('/'); // Navigate back to dashboard
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string); // Store base64
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !image) return;

    setLoading(true);

    const userMessage: Message = {
      role: 'user',
      content: [
        { type: 'text', value: prompt.trim() },
        ...(image ? [{ type: 'image', src: image, alt: 'Uploaded image' }] : []),
      ],
    };
    setConversation((prev) => [...prev, userMessage]);

    try {
      // Pass sessionId to the API for context/history saving
      const response = await axios.post('/dashboard/api/chat', { prompt, image, sessionId }); 
      const modelResponse: Message = { role: 'model', content: response.data.response };
      setConversation((prev) => [...prev, modelResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { role: 'model', content: 'Terjadi kesalahan saat berkomunikasi dengan AI.' };
      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setPrompt('');
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
      }
      setLoading(false);
    }
  };

  // Scroll to bottom of chat
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Askes AI Chat ({sessionId})</h1>
        <Button onClick={handleEndChat} variant="outline">Akhiri Chat</Button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md p-3 rounded-lg shadow-md ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-card-foreground'
              }`}
            >
              {Array.isArray(msg.content) ? (
                // Multimodal content
                msg.content.map((part, partIndex) => {
                  if (part.type === 'text') {
                    return <p key={partIndex} className="break-words">{part.value}</p>;
                  } else if (part.type === 'image') {
                    return (
                      <img
                        key={partIndex}
                        src={part.src}
                        alt={part.alt}
                        className="max-w-xs max-h-48 rounded-md mt-2"
                      />
                    );
                  }
                  return null;
                })
              ) : (
                // Simple text content
                <p className="break-words">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-md p-3 rounded-lg shadow-md bg-card text-card-foreground">
              <p>AI sedang berpikir...</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="border-t border-border p-4 bg-background">
        {image && (
          <div className="mb-2 flex items-center justify-between p-2 bg-muted rounded-md">
            <p className="text-sm">Gambar siap diunggah.</p>
            <Button variant="ghost" size="sm" onClick={() => setImage(null)}>
              X
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageChange}
          />
          <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ketik pesan Anda..."
            className="flex-1 resize-none"
            rows={1}
            disabled={loading}
          />
          <Button type="submit" disabled={loading || (!prompt.trim() && !image)}>
            <SendHorizonal className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}