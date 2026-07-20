export type CostFunction<T> = (splitPoint: T) => [next: T, cost: number][];

type DP<T> = Map<T, [splitPoint: T, cost: number][]>;

// empirically determined threshold for deterministic tiebreaking
const TIEBREAKER_EPSILON = 1.0001;

function computePartition<T>(costFn: CostFunction<T>, partitions: number, start: T, end: T) {
  // dp matrix: item x partition index x { splitPoint: previous split point, cost: accumulated cost }
  // i.e. dp.get(X)[k] represents the previous split point and accumulated cost of the best way
  // to partition items from `start` to X into k groups
  const dp: DP<T> = new Map();

  // set of split points that need to be visited
  const queue = new Set<T>();
  queue.add(start);

  for (let partition = 0; partition < partitions; partition += 1) {
    // make a copy of the current queue
    const currentQueue = [...queue.keys()];

    // clear the queue for the next iteration
    queue.clear();

    currentQueue.forEach((splitPoint) => {
      const accumulatedCost = partition > 0 ? dp.get(splitPoint)![partition][1] : 0;

      costFn(splitPoint).forEach(([next, cost]) => {
        let entry = dp.get(next);
        if (!entry) {
          entry = [];
          dp.set(next, entry);
        }

        // introducing deterministic tiebreaker to guard against edge cases where cost difference can be
        // as low as 1e-12, which leads to visual flickering during subsequent re-renders as layout continues to
        // shift back and forth
        const newCost = accumulatedCost + cost;
        const existing = entry[partition + 1];
        if (
          !existing ||
          (existing[1] > newCost && (existing[1] / newCost > TIEBREAKER_EPSILON || splitPoint < existing[0]))
        ) {
          entry[partition + 1] = [splitPoint, newCost];
        }

        if (partition < partitions - 1 && next !== end) {
          queue.add(next);
        }
      });
    });
  }

  return dp;
}

function reconstructPartition<T>(dp: DP<T>, partitions: number, end: T) {
  const splitPoints = [end];
  for (let item = end, k = partitions; k > 0; k -= 1) {
    [item] = dp.get(item)![k];
    splitPoints.push(item);
  }
  return splitPoints.reverse();
}

// Find the optimal partition of items into N groups in a weighted directed graph using dynamic programming.
export default function findOptimalPartition<T>(costFn: CostFunction<T>, partitions: number, start: T, end: T) {
  return reconstructPartition(computePartition(costFn, partitions, start, end), partitions, end);
}
