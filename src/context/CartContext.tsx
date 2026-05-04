import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
import { CartItem, CartOperation, CartState, OperationType, Product } from '../types';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';
import { getDB } from '../db/sqlite';
import NetInfo from '@react-native-community/netinfo';
import { replayOperations } from '../utils/replayOperations';

type CartAction =
  | { type: 'SET_OPERATIONS'; payload: CartOperation[] }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'SET_ONBOARDING'; payload: boolean }
  | { type: 'REPLAY_COMPLETE'; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  operations: [],
  isOffline: false,
  isSyncing: false,
  onboardingComplete: null,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_OPERATIONS':
      return { ...state, operations: action.payload };
    case 'REPLAY_COMPLETE':
      return { ...state, items: action.payload };
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };
    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };
    case 'SET_ONBOARDING':
      return { ...state, onboardingComplete: action.payload };
    default:
      return state;
  }
};

interface CartContextType extends CartState {
  addItem: (product: Product, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithDB: () => Promise<void>;
  triggerSync: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode, initialOnboardingComplete: boolean }> = ({ children, initialOnboardingComplete }) => {
  const [state, dispatch] = useReducer(cartReducer, { ...initialState, onboardingComplete: initialOnboardingComplete });

  const completeOnboarding = async () => {
    try {
      const db = getDB();
      if (!db) return;
      await db.runAsync('UPDATE settings SET value = ? WHERE key = ?', ['true', 'onboarding_complete']);
      dispatch({ type: 'SET_ONBOARDING', payload: true });
    } catch (e) {
      console.error("completeOnboarding failed", e);
    }
  };

  const syncWithDB = useCallback(async () => {
    try {
      const db = getDB();
      if (!db) return;
      
      const ops = await db.getAllAsync<CartOperation>('SELECT * FROM cart_operations');
      dispatch({ type: 'SET_OPERATIONS', payload: ops });
      const items = replayOperations(ops);
      dispatch({ type: 'REPLAY_COMPLETE', payload: items });
    } catch (e) {
      console.error("syncWithDB failed", e);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    // Access latest state via a ref or just use the current state in scope
    // To avoid dependency loops, we'll check the state directly
    if (state.isOffline || state.isSyncing) return;
    
    const db = getDB();
    if (!db) return;

    try {
      const unsyncedOps = await db.getAllAsync<CartOperation>('SELECT * FROM cart_operations WHERE synced = 0');
      
      if (unsyncedOps.length > 0) {
        dispatch({ type: 'SET_SYNCING', payload: true });
        const startTime = Date.now();
        
        console.log("Syncing operations:", unsyncedOps);
        await new Promise(resolve => setTimeout(resolve, 1000));
        for (const op of unsyncedOps) {
          await db.runAsync('UPDATE cart_operations SET synced = 1 WHERE id = ?', [op.id]);
        }
        await syncWithDB();

        // Ensure banner stays visible for at least 1.5s to prevent "shaking" (flicker)
        const duration = Date.now() - startTime;
        if (duration < 1500) {
          await new Promise(resolve => setTimeout(resolve, 1500 - duration));
        }
      }
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  }, [state.isOffline, state.isSyncing, syncWithDB]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(status => {
      dispatch({ type: 'SET_OFFLINE', payload: !status.isConnected });
      if (status.isConnected) {
        triggerSync();
      }
    });

    return () => unsubscribe();
  }, [triggerSync]);

  useEffect(() => {
    syncWithDB();
  }, [syncWithDB]);

  const addOperation = async (type: OperationType, productId: string, quantity: number, price: number) => {
    try {
      const db = getDB();
      if (!db) {
        console.warn("Cannot add operation: Database not ready");
        return;
      }

      const op: CartOperation = {
        id: uuidv4(),
        type,
        product_id: productId,
        quantity,
        price_at_op: price,
        timestamp: Date.now(),
        synced: 0,
      };

      await db.runAsync(
        'INSERT INTO cart_operations (id, type, product_id, quantity, price_at_op, timestamp, synced) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [op.id, op.type, op.product_id, op.quantity, op.price_at_op, op.timestamp, op.synced]
      );

      await syncWithDB();
    } catch (e) {
      console.error("addOperation failed", e);
    }
  };

  const addItem = async (product: Product, quantity: number) => {
    await addOperation('ADD', product.id, quantity, product.price);
  };

  const removeItem = async (productId: string) => {
    await addOperation('REMOVE', productId, 0, 0);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const db = getDB();
      if (!db) return;
      const product = await db.getFirstAsync<Product>('SELECT price FROM products WHERE id = ?', [productId]);
      await addOperation('UPDATE_QTY', productId, quantity, product?.price || 0);
    } catch (e) {
      console.error("updateQuantity failed", e);
    }
  };

  const clearCart = async () => {
    await addOperation('CLEAR', '', 0, 0);
  };

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity, clearCart, syncWithDB, triggerSync, completeOnboarding }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
