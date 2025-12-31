import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { Fatwa, Latifa } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyDgdUYq80uSRJLQcJYMzQM6nk77D4ql5Rg",
  authDomain: "tabibfaqih.firebaseapp.com",
  projectId: "tabibfaqih",
  storageBucket: "tabibfaqih.firebasestorage.app",
  messagingSenderId: "202460803784",
  appId: "1:202460803784:web:9c6cd0a97b622206f4abfd",
  measurementId: "G-KMCRY4YDWN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const FATWAS_COLLECTION = 'fatwas';
const LATAIF_COLLECTION = 'lataif';

// --- FATWAS OPERATIONS ---

export const getFatwasFromFirestore = async (): Promise<Fatwa[]> => {
  try {
    const q = query(collection(db, FATWAS_COLLECTION));
    const querySnapshot = await getDocs(q);
    const fatwas: Fatwa[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Fatwa;
      fatwas.push({ ...data, _firestoreId: doc.id } as any);
    });
    return fatwas;
  } catch (error) {
    console.error("Error fetching fatwas: ", error);
    return [];
  }
};

export const addFatwaToFirestore = async (fatwa: Fatwa): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, FATWAS_COLLECTION), fatwa);
    return docRef.id;
  } catch (error) {
    console.error("Error adding fatwa: ", error);
    return null;
  }
};

export const deleteFatwaFromFirestore = async (firestoreId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, FATWAS_COLLECTION, firestoreId));
    return true;
  } catch (error) {
    console.error("Error deleting fatwa: ", error);
    return false;
  }
};

// --- LATAIF OPERATIONS ---

export const getLataifFromFirestore = async (): Promise<Latifa[]> => {
  try {
    // We can order by ID to keep consistency
    const q = query(collection(db, LATAIF_COLLECTION), orderBy('id'));
    const querySnapshot = await getDocs(q);
    const lataif: Latifa[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Latifa;
      lataif.push({ ...data, _firestoreId: doc.id });
    });
    return lataif;
  } catch (error) {
    console.error("Error fetching lataif: ", error);
    return [];
  }
};

export const addLatifaToFirestore = async (latifa: Latifa): Promise<string | null> => {
  try {
    // Ensure we don't save undefined fields if optional
    const cleanLatifa = JSON.parse(JSON.stringify(latifa));
    const docRef = await addDoc(collection(db, LATAIF_COLLECTION), cleanLatifa);
    return docRef.id;
  } catch (error) {
    console.error("Error adding latifa: ", error);
    return null;
  }
};

export const updateLatifaInFirestore = async (latifa: Latifa): Promise<boolean> => {
  if (!latifa._firestoreId) return false;
  try {
    const latifaRef = doc(db, LATAIF_COLLECTION, latifa._firestoreId);
    const { _firestoreId, ...dataToUpdate } = latifa;
    await updateDoc(latifaRef, dataToUpdate as any);
    return true;
  } catch (error) {
    console.error("Error updating latifa: ", error);
    return false;
  }
};

export const deleteLatifaFromFirestore = async (firestoreId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, LATAIF_COLLECTION, firestoreId));
    return true;
  } catch (error) {
    console.error("Error deleting latifa: ", error);
    return false;
  }
};