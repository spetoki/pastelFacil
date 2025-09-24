"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { KeyRound } from "lucide-react";

// O PIN correto é hardcoded como "2209"
const CORRECT_PIN = "2209";

type ReportPinDialogProps = {
  onUnlock: () => void;
};

export function ReportPinDialog({ onUnlock }: ReportPinDialogProps) {
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value);
    }
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simula uma pequena demora para dar feedback ao usuário
    setTimeout(() => {
      if (pin === CORRECT_PIN) {
        toast({
          title: "Acesso Liberado!",
          description: "Visualizando relatórios.",
        });
        onUnlock();
      } else {
        toast({
          variant: "destructive",
          title: "PIN Incorreto",
          description: "Você não tem permissão para acessar esta área.",
        });
        setPin("");
      }
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="flex justify-center items-center py-16">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleConfirmPin}>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="mt-4">Acesso Restrito</CardTitle>
            <CardDescription>
              Por favor, insira o PIN de 4 dígitos do proprietário para
              visualizar os relatórios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={handlePinChange}
              maxLength={4}
              placeholder="••••"
              className="text-center text-3xl tracking-[1.5rem] font-mono h-16"
              autoFocus
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || pin.length !== 4}
            >
              {isSubmitting ? "Verificando..." : "Desbloquear Acesso"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
