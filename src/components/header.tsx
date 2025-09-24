import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";
import { LogOut } from "lucide-react";

type HeaderProps = {
  onLogout: () => void;
};

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-foreground">
              Pastelaria Fácil
            </h1>
          </div>
          <Button variant="ghost" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
