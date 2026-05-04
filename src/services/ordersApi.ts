import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { Order } from '../types';

export interface NewOrder {
  userId: string;
  items_json: string;
  total: number;
  status: string;
}

/** Submit an order to Firestore and return the new order id */
export async function submitOrder(order: NewOrder): Promise<string> {
  const ref = await addDoc(collection(firestore, 'orders'), {
    ...order,
    created_at: serverTimestamp(),
    synced_at: serverTimestamp(),
  });
  return ref.id;
}

/** Fetch all orders for a given user, newest first */
export async function fetchOrders(userId: string): Promise<Order[]> {
  const q = query(
    collection(firestore, 'orders'),
    where('userId', '==', userId),
    orderBy('created_at', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      items_json: data.items_json,
      total: data.total,
      status: data.status,
      created_at: data.created_at?.toMillis?.() ?? Date.now(),
      synced_at: data.synced_at?.toMillis?.(),
    } as Order;
  });
}
