"use client";

import { WizardShell } from "@/components/wizard/WizardShell";

export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WizardShell>{children}</WizardShell>;
}
