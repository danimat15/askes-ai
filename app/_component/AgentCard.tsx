// askes-ai/app/_component/AgentCard.tsx
"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Agent } from '@/lib/agents';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { InteractionChoiceDialog } from './InteractionChoiceDialog';

interface AgentCardProps {
  agent: Agent;
  className?: string;
}

export const AgentCard = ({ agent, className }: AgentCardProps) => {
  const [isChoiceDialogOpen, setIsChoiceDialogOpen] = useState(false);

  return (
    <>
      <div className={cn("p-4 border border-border rounded-lg shadow-sm flex flex-col items-center text-center bg-card", className)}>
        <div className="relative w-32 h-32 rounded-full mb-4 overflow-hidden border-2 border-primary/50">
          <Image
            src={agent.image}
            alt={agent.name}
            fill
            style={{ objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; }}
          />
        </div>
        <h3 className="text-lg font-bold">{agent.name}</h3>
        <p className="text-sm font-semibold text-primary mb-2">{agent.specialization}</p>
        <p className="text-xs text-muted-foreground mb-4 flex-grow">{agent.description}</p>
        <Button variant="outline" size="sm" onClick={() => setIsChoiceDialogOpen(true)}>
          Mulai Konsultasi
        </Button>
      </div>

      {isChoiceDialogOpen && (
        <InteractionChoiceDialog
          agent={agent}
          isOpen={isChoiceDialogOpen}
          onOpenChange={setIsChoiceDialogOpen}
        />
      )}
    </>
  );
};
