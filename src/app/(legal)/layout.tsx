import Link from "next/link";
import type { ReactNode } from "react";
import { LegalFooter } from "@/components/legal-footer";
import { CloudWisp } from "@/components/illustrations";
import { Logo, Reveal } from "@/components/ui";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/">
          <Logo className="text-lg" />
        </Link>
      </header>
      <div className="mx-auto flex max-w-3xl justify-center px-4 text-muted/30 sm:px-6">
        <CloudWisp className="h-8 w-40" />
      </div>
      <Reveal>
        <main className="mx-auto max-w-3xl space-y-4 px-4 pb-16 pt-2 text-sm leading-relaxed sm:px-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-6 [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </main>
      </Reveal>
      <LegalFooter />
    </div>
  );
}
