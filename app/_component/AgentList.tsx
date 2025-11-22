// askes-ai/app/_component/AgentList.tsx
"use client";

import { aiAgents } from "@/lib/agents";
import { AgentCard } from "./AgentCard";
import { motion } from 'framer-motion';

export const AgentList = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {aiAgents.map((agent, index) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <AgentCard agent={agent} />
        </motion.div>
      ))}
    </div>
  );
};
