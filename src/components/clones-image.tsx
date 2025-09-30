"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppBanner } from "@/lib/types";

const BANNER_DOC_ID = "main-banner";
const BANNER_COLLECTION_ID = "appConfig";

export function ClonesImage() {
  const [imageSrc, setImageSrc] = useState("/clones.jpg");
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const bannerRef = doc(db, BANNER_COLLECTION_ID, BANNER_DOC_ID);
    
    const unsubscribe = onSnapshot(bannerRef, (docSnap) => {
        if (docSnap.exists()) {
            const bannerData = docSnap.data() as AppBanner;
            setImageSrc(bannerData.base64);
        } else {
            // Document does not exist or was deleted, use default
            setImageSrc("/clones.jpg");
        }
    }, (error) => {
        console.error("Error fetching banner:", error);
        toast({
            variant: "destructive",
            title: "Erro ao carregar banner",
            description: "Não foi possível sincronizar o banner do banco de dados."
        });
        setImageSrc("/clones.jpg"); // Fallback to default on error
    });

    return () => unsubscribe();
  }, [toast]);

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        try {
            const bannerRef = doc(db, BANNER_COLLECTION_ID, BANNER_DOC_ID);
            await setDoc(bannerRef, { base64: result, updatedAt: new Date() });

            toast({
              title: "Banner atualizado!",
              description: "A nova imagem foi salva com sucesso.",
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Erro ao salvar",
                description: "Não foi possível salvar a imagem no banco de dados."
            })
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  if (!isMounted) {
      return (
        <div className="my-6 flex justify-center">
            <div className="relative w-full max-w-[500px] aspect-[5/4] rounded-lg bg-muted animate-pulse" />
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
