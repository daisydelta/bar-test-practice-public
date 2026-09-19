import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { LegalDisclaimer } from "@/components/legal/LegalDisclaimer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bar Test Practice | Philippine Bar Exam & Law-School ALAC Review",
  description:
    "An educational essay practice platform for Philippine Bar Examination and law-school students using the ALAC method (Answer, Legal Basis, Application, Conclusion).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50/50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        {/* Top Sticky Bar */}
        <div className="bg-indigo-950 text-amber-200/90 text-[11px] py-1.5 px-4 text-center font-medium border-b border-indigo-900/60 tracking-wide">
          Educational Bar Practice Tool • Verified Legal Grounding • Strictly No Unsupported Citations
        </div>

        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LegalDisclaimer compact />
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white py-8 mt-12 text-slate-600 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <LegalDisclaimer />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
              <p>© {new Date().getFullYear()} Bar Test Practice. Designed for Philippine Law Students &amp; Bar Reviewees.</p>
              <div className="flex items-center gap-4">
                <span>ALAC Method</span>
                <span>•</span>
                <span>Philippine Bar Subjects</span>
                <span>•</span>
                <span>CPRA &amp; StatCon</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
