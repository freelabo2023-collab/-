import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `${SITE.brandName}｜売上導線診断メーカー`,
  description:
    "小規模店舗向け。Instagram・LINE公式・予約導線の弱点を診断し、今すぐ直すべきポイントが分かる無料診断ツール。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14274e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="page">
          <header className="site-header">
            <div className="container brand">
              <span className="brand-name">{SITE.brandName}</span>
              <span className="brand-tagline">{SITE.tagline}</span>
            </div>
          </header>
          <main className="main">
            <div className="container">{children}</div>
          </main>
          <footer className="site-footer">
            <div className="container">
              © {new Date().getFullYear()} {SITE.operator}　売上導線診断メーカー
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
