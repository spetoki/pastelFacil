
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
import { deleteAllData } from "@/lib/db-utils";
import { ImageOff, Download, Smartphone, Laptop } from "lucide-react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Theme = "light" | "dark";
const BANNER_DOC_ID = "main-banner";
const BANNER_COLLECTION_ID = "appConfig";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function Settings() {
  const { toast } = useToast();
  const [language, setLanguage] = useState("pt-br");
  const [theme, setTheme] = useState<Theme>("dark");
  const [isMounted, setIsMounted] = useState(false);
  const [pin, setPin] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else {
        const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(isSystemDark ? "dark" : "light");
        document.documentElement.classList.toggle("dark", isSystemDark);
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installEvent) {
      installEvent.prompt();
      installEvent.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallEvent(null);
        setCanInstall(false);
      });
    }
  };

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
  
    const handleRestoreBanner = async () => {
        try {
            const bannerRef = doc(db, BANNER_COLLECTION_ID, BANNER_DOC_ID);
            await deleteDoc(bannerRef);
            toast({
                title: "Banner Restaurado",
                description: "O banner padrão foi restaurado com sucesso."
            });
        } catch (error) {
            console.error("Error restoring banner:", error);
            toast({
                variant: "destructive",
                title: "Erro ao Restaurar",
                description: "Não foi possível apagar o banner personalizado."
            });
        }
    }

  const handleResetApp = async () => {
    if (pin !== "2209") {
        toast({
            variant: "destructive",
            title: "PIN Incorreto",
            description: "Você não tem permissão para realizar esta ação."
        });
        setPin("");
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
          <div>
            <Label>Banner da Tela de Retiradas</Label>
            <div className="flex items-center gap-2 mt-2">
                <Button variant="outline" onClick={handleRestoreBanner}>
                    <ImageOff className="mr-2"/>
                    Restaurar Banner Padrão
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Instalar Aplicativo</CardTitle>
          <CardDescription>
            Instale o aplicativo no seu dispositivo para acesso rápido pela área de trabalho ou tela de início.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleInstallClick} disabled={!canInstall} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              {canInstall ? "Instalar no Dispositivo" : "Instalação não disponível"}
            </Button>
            {!canInstall && (
                <p className="text-xs text-muted-foreground mt-2">
                    Se você estiver usando um iPhone/iPad, abra este site no Safari, clique em "Compartilhar" e depois em "Adicionar à Tela de Início".
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
            <AlertDialog onOpenChange={() => setPin("")}>
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
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleResetApp} 
                            disabled={pin !== "2209" || isResetting}
                        >
                            {isResetting ? "Resetando..." : "Eu entendo, resetar o aplicativo"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardContent>
      </Card>
    </div>
  );
}
