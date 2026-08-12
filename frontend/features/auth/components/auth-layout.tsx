"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 inline-flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="size-4" />
            </span>
            <span className="font-semibold tracking-tight">SE-TaskFlow</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>

      <div className="hero-glow relative hidden overflow-hidden border-l border-border lg:block">
        <div className="surface-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative flex h-full flex-col justify-end p-12">
          <blockquote className="max-w-md text-xl font-medium leading-snug">
            “We replaced three tools with SE-TaskFlow and cut our planning meetings
            in half.”
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">
            Wangprai Jullapech — Project for practice, Full Stack Developer
          </p>
        </div>
      </div>
    </div>
  );
}
