import { CartItem, CartOperation } from '../types';

export const replayOperations = (operations: CartOperation[]): CartItem[] => {
  const itemsMap: Record<string, CartItem> = {};

  // Sort by timestamp ASC to ensure deterministic replay
  const sortedOps = [...operations].sort((a, b) => a.timestamp - b.timestamp);

  for (const op of sortedOps) {
    switch (op.type) {
      case 'ADD':
        if (itemsMap[op.product_id]) {
          itemsMap[op.product_id].quantity += op.quantity;
        } else {
          itemsMap[op.product_id] = {
            id: op.id,
            product_id: op.product_id,
            quantity: op.quantity,
            price_at_add: op.price_at_op,
          };
        }
        break;
      case 'REMOVE':
        delete itemsMap[op.product_id];
        break;
      case 'UPDATE_QTY':
        if (itemsMap[op.product_id]) {
          itemsMap[op.product_id].quantity = op.quantity;
        }
        break;
      case 'CLEAR':
        Object.keys(itemsMap).forEach(key => delete itemsMap[key]);
        break;
    }
  }

  return Object.values(itemsMap);
};
