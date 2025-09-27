"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { setAuthentication, isAuthenticated } from "@/lib/auth";

// O PIN correto é hardcoded como "8352"
const CORRECT_PIN = "8352";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Se o usuário já estiver autenticado na sessão, redireciona para a home
    if (isAuthenticated()) {
      router.replace("/");
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      if (pin === CORRECT_PIN) {
        setAuthentication();
        toast({
          title: "Login bem-sucedido!",
          description: "Bem-vindo(a) de volta!",
        });
        router.replace("/");
      } else {
        toast({
          variant: "destructive",
          title: "PIN Incorreto",
          description: "Por favor, tente novamente.",
        });
        setPin("");
      }
      setIsSubmitting(false);
    }, 500);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite apenas dígitos e limita o tamanho para 4
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-6">
        <Logo className="h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold font-headline text-foreground">
          Cacau Forte
        </h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Acessar Painel</CardTitle>
          <CardDescription>
            Digite seu código de 4 dígitos para continuar.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={handlePinChange}
              maxLength={4}
              placeholder="••••"
              className="text-center text-2xl tracking-[1.5rem] font-mono"
              autoFocus
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || pin.length !== 4}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
