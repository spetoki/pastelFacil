"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = "customBannerImage";

export function ClonesImage() {
  const [imageSrc, setImageSrc] = useState("/clones.jpg");
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const savedImage = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedImage) {
      setImageSrc(savedImage);
    }
  }, []);

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limite de 2MB
        toast({
          variant: "destructive",
          title: "Imagem muito grande",
          description: "Por favor, selecione uma imagem com menos de 2MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, result);
            setImageSrc(result);
            toast({
              title: "Banner atualizado!",
              description: "A nova imagem foi salva com sucesso.",
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Erro ao salvar",
                description: "Não foi possível salvar a imagem. O armazenamento pode estar cheio."
            })
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  if (!isMounted) {
      return (
        <div className="my-6 flex justify-center">
            <div className="relative w-[500px] h-[400px] rounded-lg bg-muted animate-pulse" />
        </div>
      );
  }

  return (
    <div className="my-6 flex flex-col items-center gap-4">
      <div className="relative w-full max-w-[500px] aspect-[5/4] rounded-lg overflow-hidden shadow-lg group">
        <Image
          key={imageSrc} // Força o re-render da imagem
          src={imageSrc}
          alt="Banner de clones do Viveiro Andurá"
          fill
          style={{ objectFit: 'contain' }}
          unoptimized={imageSrc.startsWith('data:')} // Evita otimização para data URLs
        />
         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Button variant="outline" onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4"/>
                Editar Banner
             </Button>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleImageChange}
      />
    </div>
  );
}
