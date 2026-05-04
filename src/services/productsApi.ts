import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  doc,
  setDoc,
  DocumentSnapshot,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { Product } from '../types';

const PAGE_SIZE = 6;

const SEED_PRODUCTS: Omit<Product, 'updated_at'>[] = [
  { id: 'p1', name: 'Premium Coffee', price: 15.99, stock: 10, image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80' },
  { id: 'p2', name: 'Organic Matcha', price: 24.50, stock: 5, image_url: 'https://images.unsplash.com/photo-1582793988951-9aed55099991?w=400&q=80' },
  { id: 'p3', name: 'Dark Chocolate', price: 8.00, stock: 20, image_url: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&q=80' },
  { id: 'p4', name: 'Almond Milk', price: 4.25, stock: 0, image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
  { id: 'p5', name: 'Honey Granola', price: 12.99, stock: 15, image_url: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&q=80' },
  { id: 'p6', name: 'Cold Brew', price: 6.50, stock: 8, image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80' },
  { id: 'p7', name: 'Earl Grey Tea', price: 9.99, stock: 12, image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&q=80' },
  { id: 'p8', name: 'Oat Milk Latte', price: 7.50, stock: 7, image_url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80' },
  { id: 'p9', name: 'Chia Pudding', price: 11.00, stock: 9, image_url: 'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=400&q=80' },
  { id: 'p10', name: 'Protein Bar', price: 3.50, stock: 25, image_url: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400&q=80' },
  { id: 'p11', name: 'Green Smoothie', price: 8.75, stock: 6, image_url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80' },
  { id: 'p12', name: 'Kombucha', price: 5.25, stock: 14, image_url: 'https://images.unsplash.com/photo-1595475038784-bbe439ff41e6?w=400&q=80' },
];

/** Seed Firestore if collection is empty */
async function seedIfEmpty() {
  const snap = await getDocs(query(collection(firestore, 'products'), limit(1)));
  if (snap.empty) {
    const now = Date.now();
    for (const p of SEED_PRODUCTS) {
      await setDoc(doc(firestore, 'products', p.id), { ...p, updated_at: now });
    }
  }
}

export interface ProductsPage {
  products: Product[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

/** First page of products — also seeds if empty */
export async function fetchProducts(): Promise<ProductsPage> {
  await seedIfEmpty();
  const q = query(collection(firestore, 'products'), orderBy('name'), limit(PAGE_SIZE));
  const snap = await getDocs(q);
  const products = snap.docs.map(d => d.data() as Product);
  return {
    products,
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    hasMore: snap.docs.length === PAGE_SIZE,
  };
}

/** Next page using cursor from previous call */
export async function fetchMoreProducts(lastDoc: DocumentSnapshot): Promise<ProductsPage> {
  const q = query(
    collection(firestore, 'products'),
    orderBy('name'),
    startAfter(lastDoc),
    limit(PAGE_SIZE),
  );
  const snap = await getDocs(q);
  const products = snap.docs.map(d => d.data() as Product);
  return {
    products,
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    hasMore: snap.docs.length === PAGE_SIZE,
  };
}

/** Single product by ID (for deep link detail screen) */
export async function fetchProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(firestore, 'products', id));
  return snap.exists() ? (snap.data() as Product) : null;
}
