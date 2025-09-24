"use client";

import {
  collection,
  getDocs,
  writeBatch,
  query,
  where,
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

export const resetFiadoData = async (): Promise<void> => {
  const batch = writeBatch(db);

  // 1. Delete "Fiado" sales
  const fiadoSalesQuery = query(collection(db, "sales"), where("paymentMethod", "==", "Fiado"));
  const fiadoSalesSnapshot = await getDocs(fiadoSalesQuery);
  fiadoSalesSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  // 2. Delete "debtPayment" transactions
  const debtPaymentsQuery = query(collection(db, "transactions"), where("type", "==", "debtPayment"));
  const debtPaymentsSnapshot = await getDocs(debtPaymentsQuery);
  debtPaymentsSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // 3. Reset debt for all clients
  const clientsQuery = query(collection(db, "clients"));
  const clientsSnapshot = await getDocs(clientsQuery);
  clientsSnapshot.forEach((doc) => {
    batch.update(doc.ref, { debt: 0 });
  });

  await batch.commit();
};
