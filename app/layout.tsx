import type { Metadata } from "next";
import { Bubblegum_Sans, Nunito } from "next/font/google";
import "./globals.css";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "ZeeMy";
const repositoryOwner = process.env.GITHUB_REPOSITORY?.split("/")[0] ?? "nandomaul";
const publicBasePath = isGitHubPages ? `/${repositoryName}` : "";
const siteUrl = isGitHubPages
  ? `https://${repositoryOwner}.github.io/${repositoryName}`
  : "https://jastip-di-zeem.nddomaul.chatgpt.site";
const publicAsset = (path: string) => `${publicBasePath}${path}`;
const socialImageUrl = `${siteUrl}/brand/jastip-di-zeem-logo-hd.png`;

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const bubblegum = Bubblegum_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jastip di Zeem — Titip Belanja Jadi Lebih Manis",
  description:
    "Lihat produk jastip terbaru, pilih barang favoritmu, lalu lanjutkan pesanan langsung melalui WhatsApp.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Jastip di Zeem",
    description: "Jastip lucu, jelas, dan tinggal lanjut lewat WhatsApp.",
    images: [socialImageUrl],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jastip di Zeem",
    description: "Jastip lucu, jelas, dan tinggal lanjut lewat WhatsApp.",
    images: [socialImageUrl],
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: [
      { url: publicAsset("/brand/zeemy-tab-icon-v3.png"), type: "image/png", sizes: "512x512" },
      { url: publicAsset("/favicon.ico"), sizes: "any" },
    ],
    shortcut: publicAsset("/favicon.ico"),
    apple: publicAsset("/brand/zeemy-apple-icon-v3.png"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${nunito.variable} ${bubblegum.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
