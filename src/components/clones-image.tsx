"use client";

import Image from "next/image";

export function ClonesImage() {
  return (
    <div className="my-6 flex justify-center">
      <div className="relative w-[500px] h-[400px] rounded-lg overflow-hidden shadow-lg">
        <Image
          src="/clones.jpg"
          alt="Banner de clones do Viveiro Andurá"
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  );
}
