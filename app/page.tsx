// askes-ai/app/page.tsx
"use client";

import React from 'react';
import { WavyBackground } from "@/components/ui/wavy-background";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, BrainCircuit } from 'lucide-react';
import { Navbar } from './_component/Navbar'; // Import Navbar

export default function LandingPage() {
  const features = [
    {
      title: "Chat Teks & Foto",
      description: "Diskusikan gejala Anda melalui teks dan unggah gambar untuk analisis yang lebih akurat.",
      icon: <MessageSquare />,
    },
    {
      title: "Percakapan Suara",
      description: "Berbicara langsung dengan agen AI kami untuk pengalaman konsultasi yang lebih natural.",
      icon: <Phone />,
    },
    {
      title: "Analisis Cerdas",
      description: "Dapatkan saran dan laporan kesehatan yang dihasilkan oleh model AI terdepan dari Google.",
      icon: <BrainCircuit />,
    },
  ];

  return (
    <div className="w-full bg-background text-foreground min-h-screen"> {/* Added min-h-screen */}
      <Navbar /> {/* Render Navbar */}
      {/* Hero Section */}
      <div className="h-screen w-full">
        <WavyBackground speed="fast" className="flex items-center justify-center text-center">
          <div className="z-10 flex flex-col items-center p-4">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 mb-4"
            >
              Asisten Kesehatan Virtual Anda
            </motion.h1>
            
            <TextGenerateEffect 
              words="Askes AI siap membantu memahami gejala, menganalisis gambar, mendapatkan informasi, dan terhubung dengan agen AI spesialis kapan saja, di mana saja."
              className="max-w-2xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 3 }} // Delayed to appear after text generation
            >
              <Link href="/sign-in" className="mt-8 inline-block">
                <button className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-transform transform hover:scale-105">
                  Mulai Konsultasi Gratis
                </button>
              </Link>
            </motion.div>
          </div>
        </WavyBackground>
      </div>

      {/* Features Section */}
      <section className="py-20 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Fitur Unggulan</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="p-6 bg-card border border-border rounded-lg text-center"
            >
              <div className="flex justify-center mb-4 text-primary">
                {React.cloneElement(feature.icon, { className: "w-12 h-12" })}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-card border-t border-border px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Mencoba?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Dapatkan akses instan ke asisten kesehatan AI Anda. Gratis, cepat, dan rahasia. Mulai percakapan pertama Anda sekarang.
          </p>
          <Link href="/sign-in">
            <button className="px-10 py-4 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-transform transform hover:scale-105">
              Mulai Konsultasi
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
