import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
const sans=Geist({variable:"--font-sans",subsets:["latin"]}); const mono=Geist_Mono({variable:"--font-mono",subsets:["latin"]});
export const metadata:Metadata={title:"90+ PREDICT | W杯ファイナル予想",description:"W杯2026の決勝・3位決定戦を仲間と予想して楽しむゲーム",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><body className={`${sans.variable} ${mono.variable}`}>{children}</body></html>}
