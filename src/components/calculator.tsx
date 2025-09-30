"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalculatorIcon } from "lucide-react";

export function Calculator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<number | string>("");

  // Function to safely evaluate mathematical expressions
  const safeEval = (expr: string): number => {
    // Replace user-friendly symbols with JavaScript Math functions
    let safeExpr = expr
      .replace(/x/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'Math.PI')
      .replace(/\^/g, '**')
      // Handle square root
      .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)')
      // Handle trig and log functions
      .replace(/sin\(([^)]+)\)/g, 'Math.sin(Math.PI / 180 * $1)') // Assuming degrees
      .replace(/cos\(([^)]+)\)/g, 'Math.cos(Math.PI / 180 * $1)') // Assuming degrees
      .replace(/tan\(([^)]+)\)/g, 'Math.tan(Math.PI / 180 * $1)') // Assuming degrees
      .replace(/ln\(([^)]+)\)/g, 'Math.log($1)');

    // Use a Function constructor for safer evaluation than direct eval()
    return new Function('return ' + safeExpr)();
  };

  const handleButtonClick = (value: string) => {
    if (value === "C") {
      setInput("");
      setResult("");
    } else if (value === "=") {
      if (!input) return;
      try {
        const evalResult = safeEval(input);
        setResult(evalResult);
        setInput(String(evalResult));
      } catch (error) {
        setResult("Erro");
      }
    } else if (value === "Del") {
      setInput((prev) => prev.slice(0, -1));
    } else {
      setInput((prev) => prev + value);
    }
  };

  const buttons = [
    "(", ")", "ln", "Del",
    "sin", "cos", "tan", "π",
    "7", "8", "9", "÷",
    "4", "5", "6", "x",
    "1", "2", "3", "-",
    "0", ".", "^", "+",
    "√(",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalculatorIcon className="h-5 w-5" />
          Calculadora Científica
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
            variant="outline"
            className="col-span-3"
            onClick={() => handleButtonClick("C")}
          >
            Limpar (C)
          </Button>
           <Button
            variant="destructive"
            onClick={() => handleButtonClick("=")}
          >
            =
          </Button>
          {buttons.map((btn) => (
            <Button
              key={btn}
              variant="outline"
              className="h-12 text-lg"
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
