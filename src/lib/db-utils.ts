"use client";

import {
  collection,
  getDocs,
  writeBatch,
  query,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const deleteAllData = async (): Promise<void> => {
  const collectionsToDelete = [
    "products",
    "clients",
    "sales",
    "transactions",
    "dailySummaries",
    "appStatus",
    "appConfig"
  ];
  
  const batch = writeBatch(db);

  for (const collectionName of collectionsToDelete) {
    const q = query(collection(db, collectionName));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
  }

  // After deleting, create the initial appStatus document
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const statusRef = doc(db, "appStatus", "main");
  batch.set(statusRef, { currentShiftStart: Timestamp.fromDate(startOfToday) });

  await batch.commit();
};
