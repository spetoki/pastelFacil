"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "./ui/input";
import { deleteAllData, resetFiadoData } from "@/lib/db-utils";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { Download } from "lucide-react";

type Theme = "light" | "dark";

export function Settings() {
  const { toast } = useToast();
  const [language, setLanguage] = useState("pt-br");
  const [theme, setTheme] = useState<Theme>("dark");
  const [isMounted, setIsMounted] = useState(false);
  const [pin, setPin] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isResettingFiado, setIsResettingFiado] = useState(false);
  const { canInstall, install } = usePwaInstall();

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast({
      title: "Idioma (Interface)",
      description:
        "A funcionalidade de mudança de idioma é apenas visual no momento.",
    });
  };

  const handleThemeChange = (isDark: boolean) => {
    const newTheme = isDark ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", isDark);
    toast({
      title: `Tema alterado para modo ${isDark ? "Escuro" : "Claro"}!`,
    });
  };
  
  const handleResetApp = async () => {
    if (pin !== "2209") {
        toast({
            variant: "destructive",
            title: "PIN Incorreto",
            description: "Você não tem permissão para realizar esta ação."
        });
        return;
    }
    
    setIsResetting(true);
    try {
        await deleteAllData();
        toast({
            title: "Aplicativo Resetado!",
            description: "Todos os dados foram apagados. A página será recarregada."
        });
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } catch(error) {
        console.error("Error resetting app:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Resetar",
            description: "Não foi possível apagar os dados. Tente novamente."
        });
        setIsResetting(false);
    }
  }

  const handleResetFiado = async () => {
    if (pin !== "2209") {
        toast({
            variant: "destructive",
            title: "PIN Incorreto",
            description: "Você não tem permissão para realizar esta ação."
        });
        return;
    }
    
    setIsResettingFiado(true);
    try {
        await resetFiadoData();
        toast({
            title: "Dados de Fiado Resetados!",
            description: "Vendas fiado, pagamentos e dívidas de clientes foram zerados. A página será recarregada."
        });
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } catch(error) {
        console.error("Error resetting fiado data:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Resetar Fiado",
            description: "Não foi possível apagar os dados de fiado. Tente novamente."
        });
        setIsResettingFiado(false);
    }
  }

  if (!isMounted) {
    return null; // ou um skeleton
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
           <CardDescription>Ajuste as preferências de idioma e aparência do aplicativo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language-select">Idioma</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language-select" className="w-[280px]">
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                <SelectItem value="en-us">Inglês (EUA)</SelectItem>
                <SelectItem value="es-es">Espanhol</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="dark-mode-switch">Modo Escuro</Label>
            <Switch
              id="dark-mode-switch"
              checked={theme === "dark"}
              onCheckedChange={handleThemeChange}
            />
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Instalação do Aplicativo</CardTitle>
           <CardDescription>Instale o aplicativo em seu dispositivo para acesso rápido e uma experiência mais integrada.</CardDescription>
        </CardHeader>
        <CardContent>
            {canInstall ? (
              <Button onClick={install}>
                <Download className="mr-2 h-4 w-4" />
                Instalar Aplicativo
              </Button>
            ) : (
                <p className="text-sm text-muted-foreground">
                    O aplicativo já está instalado ou seu navegador não suporta a instalação.
                </p>
            )}
        </CardContent>
      </Card>

      <Card className="border-destructive">
          <CardHeader>
              <CardTitle>Zona de Perigo</CardTitle>
              <CardDescription>Ações nesta seção são permanentes e não podem ser desfeitas.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">Resetar Aplicativo</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                           Esta ação é irreversível. Todos os dados de produtos, clientes, vendas e relatórios serão
                             <span className="font-bold text-destructive"> excluídos permanentemente</span>. 
                            Para confirmar, digite o PIN de proprietário.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                     <div className="py-2">
                        <Label htmlFor="pin-reset">PIN de Confirmação</Label>
                        <Input 
                            id="pin-reset"
                            type="password"
                            maxLength={4}
                            placeholder="••••"
                            className="text-center tracking-widest mt-2"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                        />
                     </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPin("")}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleResetApp} 
                            disabled={pin !== "2209" || isResetting}
                        >
                            {isResetting ? "Resetando..." : "Eu entendo, resetar o aplicativo"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="bg-orange-600 hover:bg-orange-700">Zerar Dados de Fiado</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Zerar Dados de Fiado?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação irá apagar <span className="font-bold text-destructive">todas as vendas "Fiado"</span> e <span className="font-bold text-destructive">todos os recebimentos de dívidas</span>. A dívida de todos os clientes será <span className="font-bold text-destructive">zerada</span>. Esta ação é irreversível.
                            Para confirmar, digite o PIN de proprietário.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                     <div className="py-2">
                        <Label htmlFor="pin-reset-fiado">PIN de Confirmação</Label>
                        <Input 
                            id="pin-reset-fiado"
                            type="password"
                            maxLength={4}
                            placeholder="••••"
                            className="text-center tracking-widest mt-2"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                        />
                     </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPin("")}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleResetFiado} 
                            disabled={pin !== "2209" || isResettingFiado}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {isResettingFiado ? "Zerando..." : "Sim, zerar dados de fiado"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardContent>
      </Card>
    </div>
  );
}
