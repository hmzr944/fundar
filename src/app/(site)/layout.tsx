import type { ReactNode } from "react";
import { LegalFooter } from "@/components/legal-footer";
import { SiteHeader } from "@/components/site-header";
import { Ambient } from "@/components/ui";
import { currentUser } from "@/lib/http";

/** Tarifs, questions, contact: the landing's header and footer around a page. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  return (
    <div className="min-h-dvh overflow-x-clip">
      <Ambient />
      <SiteHeader signedIn={Boolean(user)} />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-10 lg:pt-16">{children}</main>
      <LegalFooter />
    </div>
  );
}
