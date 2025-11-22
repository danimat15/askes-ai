"use client";

import { Navbar } from "../_component/Navbar";
import { ConsultationDialog } from "../_component/ConsultationDialog";
import { HistoryList } from "../_component/HistoryList";
import { AgentList } from "../_component/AgentList";

export default function DashboardPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      <main className="px-10 md:px-20 lg:px-40 py-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <ConsultationDialog />
        </div>

        {/* Riwayat Konsultasi Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Riwayat Konsultasi</h2>
          <HistoryList />
        </section>

        {/* Agen Spesialis AI Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Agen Spesialis AI</h2>
          <AgentList />
        </section>
      </main>
    </div>
  );
}


