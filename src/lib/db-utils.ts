// Este arquivo não existe, mas será criado para conter a lógica de reset.
"use client";

import {
  collection,
  getDocs,
  writeBatch,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const deleteAllData = async (): Promise<void> => {
  const collectionsToDelete = [
    "products",
    "clients",
    "sales",
    "transactions",
    "dailySummaries",
  ];
  
  const batch = writeBatch(db);

  for (const collectionName of collectionsToDelete) {
    const q = query(collection(db, collectionName));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
  }

  await batch.commit();
};