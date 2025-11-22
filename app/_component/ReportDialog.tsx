// askes-ai/app/_component/ReportDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReportDialogProps {
  report: any; // The JSON report object
  trigger?: React.ReactNode; // Optional trigger element
}

export const ReportDialog = ({ report, trigger }: ReportDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button variant="outline" size="sm">Lihat Laporan</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Laporan Konsultasi</DialogTitle>
          <DialogDescription>
            Berikut adalah ringkasan dan detail laporan yang dihasilkan AI.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-sm space-y-3">
          {report ? (
            <>
              {report.chief_complaint && (
                <div>
                  <h4 className="font-semibold text-primary">Keluhan Utama:</h4>
                  <p>{report.chief_complaint}</p>
                </div>
              )}
              {report.summary_of_conversation && (
                <div>
                  <h4 className="font-semibold text-primary">Ringkasan Percakapan:</h4>
                  <p>{report.summary_of_conversation}</p>
                </div>
              )}
              {report.identified_symptoms && report.identified_symptoms.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary">Gejala Teridentifikasi:</h4>
                  <ul className="list-disc pl-5">
                    {report.identified_symptoms.map((symptom: string, index: number) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}
              {report.possible_conditions && report.possible_conditions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary">Kemungkinan Kondisi:</h4>
                  <ul className="list-disc pl-5">
                    {report.possible_conditions.map((condition: string, index: number) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                </div>
              )}
              {report.medication_mentioned && report.medication_mentioned.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary">Obat yang Disebutkan/Disarankan:</h4>
                  <ul className="list-disc pl-5">
                    {report.medication_mentioned.map((med: string, index: number) => (
                      <li key={index}>{med}</li>
                    ))}
                  </ul>
                </div>
              )}
              {report.recommendations && report.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary">Rekomendasi:</h4>
                  <ul className="list-disc pl-5">
                    {report.recommendations.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              {report.disclaimer && (
                <div className="text-xs text-muted-foreground italic mt-4">
                  <h4 className="font-semibold">Disclaimer:</h4>
                  <p>{report.disclaimer}</p>
                </div>
              )}
            </>
          ) : (
            <p>Tidak ada laporan yang tersedia.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
