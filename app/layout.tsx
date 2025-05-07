import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatContextProvider } from "@/components/chat-context-provider";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Janay Harris || Portfolio ",
  description:
    "An AI assistant to help you learn about Janay Harris's skills and experience.",
  generator: "v0.dev",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body
        className={cn("flex min-h-svh flex-col antialiased", inter.className)}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider delayDuration={0}>
            <ChatContextProvider>
              <SidebarProvider defaultOpen={false}>
                <ChatSidebar />
                <div className="flex-1 flex flex-col">
                  <header className="border-b p-2 flex items-center justify-between bg-card/80 sticky top-0">
                    <div className="flex items-center">
                      <SidebarTrigger className="mr-2" />
                      <h1 className="text-lg font-semibold"></h1>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                    </div>
                  </header>
                  <main className="flex-1 overflow-hidden">{children}</main>
                </div>
              </SidebarProvider>
            </ChatContextProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
