/**
 * Batch updates - allows multiple signal updates to be batched together
 * Effects and computed values will only update once after all batched updates complete
 */

type UpdateFn = () => void;
const updateQueue: UpdateFn[] = [];
let isBatching = false;
let scheduledFlush = false;

function flushUpdates(): void {
  if (updateQueue.length === 0) {
    scheduledFlush = false;
    return;
  }

  // Copy queue and clear it to prevent re-entrancy
  const updates = updateQueue.slice();
  updateQueue.length = 0;
  scheduledFlush = false;

  // Execute all updates with error handling
  for (const update of updates) {
    try {
      update();
    } catch (error) {
      console.error('Error in batched update:', error);
      // Continue with other updates
    }
  }
}

/**
 * Batches multiple updates together
 * All signal updates within the callback will be batched, and effects will only run once after all updates
 */
export function batch<T>(fn: () => T): T {
  const wasBatching = isBatching;
  isBatching = true;

  try {
    const result = fn();
    
    // If this is the outer batch call, flush updates
    if (!wasBatching) {
      flushUpdates();
    }
    
    return result;
  } finally {
    isBatching = wasBatching;
  }
}

/**
 * Schedules an update to be batched
 * Internal use - called by signals when they update
 */
export function scheduleUpdate(update: UpdateFn): void {
  updateQueue.push(update);
  
  if (!isBatching && !scheduledFlush) {
    scheduledFlush = true;
    // Use microtask to batch updates in the same tick
    Promise.resolve().then(flushUpdates);
  }
}

/**
 * Checks if we're currently in a batch
 */
export function isBatchingUpdates(): boolean {
  return isBatching;
}

