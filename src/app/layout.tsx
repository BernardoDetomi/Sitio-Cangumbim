import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans',
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: "Sítio Cangumbim - Seu refúgio em Resende Costa, MG",
  description: "Viva dias de descanso no Sítio Cangumbim. Cachoeira no quintal, 3 quartos (2 suítes), Wi-Fi e todo conforto no Povoado dos Pinto.",
  keywords: ["sítio", "Resende Costa", "aluguel de temporada", "cachoeira", "MG", "natureza"],
  openGraph: {
    title: "Sítio Cangumbim",
    description: "Seu refúgio completo com cachoeira no quintal",
    images: ["/IMG_1073.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
