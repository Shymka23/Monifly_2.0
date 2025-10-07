"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function UserAuthMenu() {
  const { data: session, status } = useSession();
  const { t } = useTranslation(["auth"]);

  if (status === "loading") return null;

  if (!session) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => signIn()}
        className="h-8 px-3 text-xs border-border/50 bg-background/80 hover:bg-primary/10 hover:text-primary transition-all duration-300"
      >
        <LogIn className="h-3 w-3 mr-1 sm:mr-2 transition-transform duration-300 group-hover:scale-110" />
        <span className="hidden xs:inline">{t("login.submit")}</span>
        <span className="xs:hidden">{t("login.shortSubmit")}</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/50">
        <User className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground truncate max-w-20">
          {session.user?.email?.split("@")[0] || session.user?.name}
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="h-8 px-2 sm:px-3 text-xs border-border/50 bg-background/80 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group"
      >
        <LogOut className="h-3 w-3 sm:mr-1 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
        <span className="hidden sm:inline">{t("login.logout")}</span>
      </Button>
    </div>
  );
}
