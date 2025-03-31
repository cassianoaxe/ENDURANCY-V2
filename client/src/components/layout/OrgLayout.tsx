import React, { useState, ReactNode } from "react";
import Header from "@/components/layout/Header";
import OrgSidebar from "@/components/layout/OrgSidebar";
import { Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notifications } from "@/components/features/Notifications";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface OrgLayoutProps {
  children: ReactNode;
}

export default function OrgLayout({ children }: OrgLayoutProps) {
  const [openMobile, setOpenMobile] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-30">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpenMobile(true)}
            >
              <Menu size={20} />
            </Button>
            <div className="flex items-center gap-3">
              <img
                src="/endurancy-logo.png"
                alt="Endurancy"
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.src = "/logo-placeholder.svg";
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell size={18} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <OrgSidebar openMobile={openMobile} setOpenMobile={setOpenMobile} />

        <main className="flex-1 overflow-y-auto md:pl-64 pt-6 pb-16">
          <div className="container mx-auto px-4 max-w-6xl">
            {children}
          </div>
        </main>
      </div>

      {/* Modal de notificações */}
      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-semibold">Notificações</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationsOpen(false)}
            >
              <X size={18} />
            </Button>
          </div>
          <div className="py-4">
            <Notifications />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}