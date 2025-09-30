"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalculatorIcon } from "lucide-react";

type Operator = "+" | "-" | "x" | "÷";

export function Calculator() {
  const [currentValue, setCurrentValue] = useState("0");
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(true);

  const calculate = () => {
    if (!previousValue || !operator) return parseFloat(currentValue);

    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);

    switch (operator) {
      case "+":
        return prev + current;
      case "-":
        return prev - current;
      case "x":
        return prev * current;
      case "÷":
        return prev / current;
      default:
        return current;
    }
  };

  const handleNumberClick = (value: string) => {
    if (isNewEntry) {
      setCurrentValue(value);
      setIsNewEntry(false);
    } else {
      if (currentValue === "0" && value !== ".") {
        setCurrentValue(value);
      } else if (value === "." && currentValue.includes(".")) {
        return; // No duplicate dots
      } else {
        setCurrentValue((prev) => prev + value);
      }
    }
  };

  const handleOperatorClick = (op: Operator) => {
    if (previousValue && operator && !isNewEntry) {
      const result = calculate();
      setPreviousValue(String(result));
      setCurrentValue(String(result));
    } else {
      setPreviousValue(currentValue);
    }
    setOperator(op);
    setIsNewEntry(true);
  };

  const handleEqualsClick = () => {
    if (!previousValue || !operator) return;
    const result = calculate();
    setCurrentValue(String(result));
    setPreviousValue(null);
    setOperator(null);
    setIsNewEntry(true);
  };

  const handlePercentageClick = () => {
    if (previousValue && operator) {
      // Calculates percentage based on the previous value (e.g., 100 + 10% = 110)
      const prev = parseFloat(previousValue);
      const current = parseFloat(currentValue);
      const percentageValue = (prev * current) / 100;
      setCurrentValue(String(percentageValue));
    } else {
      // Just converts the number to its percentage representation (e.g., 50 -> 0.5)
      const current = parseFloat(currentValue);
      setCurrentValue(String(current / 100));
    }
  };
  
  const handleClearClick = (allClear: boolean = false) => {
    if (allClear) {
        setPreviousValue(null);
        setOperator(null);
    }
    setCurrentValue("0");
    setIsNewEntry(true);
  };

  const handleDeleteClick = () => {
    if (currentValue.length > 1) {
        setCurrentValue(prev => prev.slice(0, -1));
    } else {
        setCurrentValue("0");
        setIsNewEntry(true);
    }
  };

  const buttons = [
    { label: "AC", handler: () => handleClearClick(true), variant: "destructive" as const, className: "col-span-2" },
    { label: "C", handler: () => handleClearClick(false), variant: "outline" as const, className: "" },
    { label: "÷", handler: () => handleOperatorClick("÷"), variant: "secondary" as const, className: "text-lg" },
    
    { label: "7", handler: () => handleNumberClick("7"), variant: "outline" as const, className: "text-lg" },
    { label: "8", handler: () => handleNumberClick("8"), variant: "outline" as const, className: "text-lg" },
    { label: "9", handler: () => handleNumberClick("9"), variant: "outline" as const, className: "text-lg" },
    { label: "x", handler: () => handleOperatorClick("x"), variant: "secondary" as const, className: "text-lg" },
    
    { label: "4", handler: () => handleNumberClick("4"), variant: "outline" as const, className: "text-lg" },
    { label: "5", handler: () => handleNumberClick("5"), variant: "outline" as const, className: "text-lg" },
    { label: "6", handler: () => handleNumberClick("6"), variant: "outline" as const, className: "text-lg" },
    { label: "-", handler: () => handleOperatorClick("-"), variant: "secondary" as const, className: "text-lg" },
    
    { label: "1", handler: () => handleNumberClick("1"), variant: "outline" as const, className: "text-lg" },
    { label: "2", handler: () => handleNumberClick("2"), variant: "outline" as const, className: "text-lg" },
    { label: "3", handler: () => handleNumberClick("3"), variant: "outline" as const, className: "text-lg" },
    { label: "+", handler: () => handleOperatorClick("+"), variant: "secondary" as const, className: "text-lg" },
    
    { label: "0", handler: () => handleNumberClick("0"), variant: "outline" as const, className: "text-lg" },
    { label: ".", handler: () => handleNumberClick("."), variant: "outline" as const, className: "text-lg" },
    { label: "%", handler: handlePercentageClick, variant: "secondary" as const, className: "" },
    { label: "=", handler: handleEqualsClick, variant: "default" as const, className: "text-lg" },
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
          value={currentValue}
          className="text-right text-3xl font-mono h-16"
          placeholder="0"
        />
        <div className="grid grid-cols-4 gap-2">
          {buttons.map((btn) => (
            <Button
              key={btn.label}
              variant={btn.variant}
              className={`h-14 text-xl ${btn.className}`}
              onClick={btn.handler}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
