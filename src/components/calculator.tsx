"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalculatorIcon } from "lucide-react";

export function Calculator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<number | string>("");

  const handleButtonClick = (value: string) => {
    if (value === "C") {
      setInput("");
      setResult("");
    } else if (value === "=") {
      try {
        // Using a safe evaluation method is crucial here.
        // For a production app, a dedicated math expression parser would be safer.
        // eval() is used here for simplicity.
        // eslint-disable-next-line no-eval
        const evalResult = eval(input.replace(/x/g, '*').replace(/÷/g, '/'));
        setResult(evalResult);
        setInput(String(evalResult));
      } catch (error) {
        setResult("Erro");
      }
    } else {
      setInput((prev) => prev + value);
    }
  };

  const buttons = [
    "7", "8", "9", "÷",
    "4", "5", "6", "x",
    "1", "2", "3", "-",
    "0", ".", "=", "+",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalculatorIcon className="h-5 w-5" />
          Calculadora
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          readOnly
          value={input}
          className="text-right text-2xl font-mono h-14"
          placeholder="0"
        />
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="destructive"
            className="col-span-4"
            onClick={() => handleButtonClick("C")}
          >
            Limpar (C)
          </Button>
          {buttons.map((btn) => (
            <Button
              key={btn}
              variant="outline"
              className="h-14 text-xl"
              onClick={() => handleButtonClick(btn)}
            >
              {btn}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
