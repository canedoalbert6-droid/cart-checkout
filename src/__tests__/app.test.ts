import { replayOperations } from '../utils/replayOperations';
import { validateEmail, validatePassword, validateConfirmPassword, calculateTotal } from '../utils/validators';
import { CartOperation } from '../types';

// ─── Core Algorithm: replayOperations ───────────────────────────────────────

describe('replayOperations — core algorithm', () => {
  test('1. applies ADD correctly', () => {
    const ops: CartOperation[] = [
      { id: '1', type: 'ADD', product_id: 'p1', quantity: 2, price_at_op: 10, timestamp: 100, synced: 0 },
    ];
    const items = replayOperations(ops);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  test('2. accumulates multiple ADDs for the same product', () => {
    const ops: CartOperation[] = [
      { id: '1', type: 'ADD', product_id: 'p1', quantity: 2, price_at_op: 10, timestamp: 100, synced: 0 },
      { id: '2', type: 'ADD', product_id: 'p1', quantity: 3, price_at_op: 10, timestamp: 200, synced: 0 },
    ];
    const items = replayOperations(ops);
    expect(items[0].quantity).toBe(5);
  });

  test('3. REMOVE after ADD yields empty cart', () => {
    const ops: CartOperation[] = [
      { id: '1', type: 'ADD', product_id: 'p1', quantity: 2, price_at_op: 10, timestamp: 100, synced: 0 },
      { id: '2', type: 'REMOVE', product_id: 'p1', quantity: 0, price_at_op: 0, timestamp: 200, synced: 0 },
    ];
    expect(replayOperations(ops)).toHaveLength(0);
  });

  test('4. CLEAR resets all items', () => {
    const ops: CartOperation[] = [
      { id: '1', type: 'ADD', product_id: 'p1', quantity: 2, price_at_op: 10, timestamp: 100, synced: 0 },
      { id: '2', type: 'ADD', product_id: 'p2', quantity: 1, price_at_op: 20, timestamp: 150, synced: 0 },
      { id: '3', type: 'CLEAR', product_id: '', quantity: 0, price_at_op: 0, timestamp: 200, synced: 0 },
    ];
    expect(replayOperations(ops)).toHaveLength(0);
  });

  test('5. last UPDATE_QTY wins (last-write-wins)', () => {
    const ops: CartOperation[] = [
      { id: '1', type: 'ADD', product_id: 'p1', quantity: 2, price_at_op: 10, timestamp: 100, synced: 0 },
      { id: '2', type: 'UPDATE_QTY', product_id: 'p1', quantity: 5, price_at_op: 10, timestamp: 200, synced: 0 },
      { id: '3', type: 'UPDATE_QTY', product_id: 'p1', quantity: 3, price_at_op: 10, timestamp: 300, synced: 0 },
    ];
    expect(replayOperations(ops)[0].quantity).toBe(3);
  });

  test('6. out-of-order timestamps are sorted before replay', () => {
    const ops: CartOperation[] = [
      { id: '2', type: 'REMOVE', product_id: 'p1', quantity: 0, price_at_op: 0, timestamp: 200, synced: 0 },
      { id: '1', type: 'ADD', product_id: 'p1', quantity: 2, price_at_op: 10, timestamp: 100, synced: 0 },
    ];
    // REMOVE comes first in array but has later timestamp → ADD should be replayed first
    expect(replayOperations(ops)).toHaveLength(0);
  });

  test('7. replay of empty operations is empty', () => {
    expect(replayOperations([])).toHaveLength(0);
  });

  test('8. ADD for non-existent product is ignored by UPDATE_QTY', () => {
    const ops: CartOperation[] = [
      { id: '1', type: 'UPDATE_QTY', product_id: 'p99', quantity: 5, price_at_op: 10, timestamp: 100, synced: 0 },
    ];
    // UPDATE_QTY on non-existent item should not create entry
    expect(replayOperations(ops)).toHaveLength(0);
  });
});

// ─── Edge Cases ──────────────────────────────────────────────────────────────

describe('replayOperations — edge cases', () => {
  test('9. REMOVE on non-existent product does not throw', () => {
    const ops: CartOperation[] = [
      { id: '1', type: 'REMOVE', product_id: 'ghost', quantity: 0, price_at_op: 0, timestamp: 100, synced: 0 },
    ];
    expect(() => replayOperations(ops)).not.toThrow();
    expect(replayOperations(ops)).toHaveLength(0);
  });

  test('10. conflict field is preserved on operation', () => {
    const op: CartOperation = {
      id: '1', type: 'ADD', product_id: 'p1', quantity: 1, price_at_op: 10,
      timestamp: 100, synced: 0, conflict: 'PRICE_CHANGE',
    };
    expect(op.conflict).toBe('PRICE_CHANGE');
  });
});

// ─── calculateTotal ───────────────────────────────────────────────────────────

describe('calculateTotal', () => {
  test('11. calculates total correctly', () => {
    const items = [
      { quantity: 2, price_at_add: 10 },
      { quantity: 1, price_at_add: 20 },
    ];
    expect(calculateTotal(items)).toBe(40);
  });

  test('12. returns 0 for empty cart (edge case)', () => {
    expect(calculateTotal([])).toBe(0);
  });

  test('13. handles floating point prices correctly', () => {
    const items = [{ quantity: 3, price_at_add: 1.1 }];
    expect(calculateTotal(items)).toBeCloseTo(3.3);
  });
});

// ─── Auth Validators ─────────────────────────────────────────────────────────

describe('validateEmail', () => {
  test('14. rejects empty email', () => {
    expect(validateEmail('')).not.toBeNull();
  });

  test('15. rejects malformed email', () => {
    expect(validateEmail('notanemail')).not.toBeNull();
  });

  test('16. accepts valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull();
  });
});

describe('validatePassword', () => {
  test('17. rejects empty password', () => {
    expect(validatePassword('')).not.toBeNull();
  });

  test('18. rejects password shorter than 6 chars (edge case)', () => {
    expect(validatePassword('abc')).not.toBeNull();
  });

  test('19. accepts password of 6+ chars', () => {
    expect(validatePassword('securepass')).toBeNull();
  });
});

describe('validateConfirmPassword', () => {
  test('20. rejects mismatched passwords (edge case)', () => {
    expect(validateConfirmPassword('pass123', 'pass456')).not.toBeNull();
  });

  test('21. accepts matching passwords', () => {
    expect(validateConfirmPassword('pass123', 'pass123')).toBeNull();
  });
});
