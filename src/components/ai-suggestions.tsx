"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "@/lib/types";
import {
  suggestRelatedProducts,
  type SuggestRelatedProductsOutput,
} from "@/ai/flows/suggest-related-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type AiSuggestionsProps = {
  cartItems: CartItem[];
};

export function AiSuggestions({ cartItems }: AiSuggestionsProps) {
  const [suggestions, setSuggestions] =
    useState<SuggestRelatedProductsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cartItems.length === 0) {
      setSuggestions(null);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const input = {
          cartItems: cartItems.map((item) => ({
            name: item.product.name,
            description: item.product.description,
          })),
        };
        const result = await suggestRelatedProducts(input);
        setSuggestions(result);
      } catch (e) {
        setError("Não foi possível carregar as sugestões.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(debounceTimer);
  }, [cartItems]);

  const hasSuggestions = suggestions && suggestions.suggestions.length > 0;

  return (
    <Card className="bg-accent/20 border-accent/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent-foreground/80">
          <Lightbulb className="h-5 w-5" />
          <span>Sugestões</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        )}
        {!isLoading && error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {!isLoading && !error && !hasSuggestions && cartItems.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma sugestão no momento.
          </p>
        )}
        {!isLoading && !error && !hasSuggestions && cartItems.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Adicione itens ao carrinho para ver sugestões.
          </p>
        )}
        {!isLoading && hasSuggestions && (
          <ul className="space-y-3">
            {suggestions.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm">
                <p className="font-semibold text-foreground">{suggestion.name}</p>
                <p className="text-muted-foreground">{suggestion.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
