"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";
import { LogOut, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Page } from "@/app/page";
import {
  DollarSign,
  Package,
  ShoppingCart,
  ClipboardList,
  Users,
  FileText,
  Settings,
  FileSignature,
} from "lucide-react";
import { cn } from "@/lib/utils";

type HeaderProps = {
  onLogout: () => void;
  activePage: Page;
  onPageChange: (page: Page) => void;
};

const navItems: { page: Page; label: string; icon: React.ElementType }[] = [
  { page: "estoque", label: "Estoque", icon: Package },
  { page: "clientes", label: "Clientes", icon: Users },
  { page: "vendas", label: "Vendas", icon: DollarSign },
  { page: "contratos", label: "Contratos", icon: FileSignature },
  { page: "fechamento", label: "Fechamento", icon: ClipboardList },
  { page: "relatorios", label: "Relatórios", icon: FileText },
  { page: "configuracoes", label: "Configurações", icon: Settings },
];

export function Header({ onLogout, activePage, onPageChange }: HeaderProps) {
  return (
    <header className="bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="px-2" onClick={() => onPageChange('caixa')}>
              <Logo className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-headline text-foreground ml-2 hidden sm:block">
                Viveiro Andurá
              </h1>
            </Button>
             <Button 
                variant={activePage === 'caixa' ? "secondary" : "ghost"}
                onClick={() => onPageChange('caixa')}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Retiradas
            </Button>
          </div>
          <div className="flex items-center gap-4">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Menu className="mr-2 h-4 w-4" />
                    <span className="hidden md:block">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navItems.map(({ page, label, icon: Icon }) => (
                  <DropdownMenuItem key={page} onSelect={() => onPageChange(page)} className={cn(activePage === page && "bg-accent")}>
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{label}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                 <DropdownMenuItem onSelect={onLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
