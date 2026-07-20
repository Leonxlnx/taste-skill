import { ratio, round } from "../../utils";
import type { LayoutModel, Photo } from "../../types";

// empirically determined threshold for deterministic tiebreaking
const TIEBREAKER_EPSILON = 1.005;

// guesstimate the maximum number of photos per row based on
// the aspect ratio of the container with images and minimal aspect ratio of all photos
function findMaxPhotosPerRow(
  photos: readonly Photo[],
  containerWidth: number,
  targetRowHeight: number,
  minPhotos?: number,
) {
  return (
    round(containerWidth / targetRowHeight / Math.min(...photos.map((photo) => ratio(photo)))) + (minPhotos || 0) + 2
  );
}

// get the height for a set of photos in a potential row
function getCommonHeight(photos: readonly Photo[], containerWidth: number, spacing: number, padding: number) {
  return (
    (containerWidth - (photos.length - 1) * spacing - 2 * padding * photos.length) /
    photos.reduce((acc, photo) => acc + ratio(photo), 0)
  );
}

// calculate the cost of a row containing photos[i..j)
// returns undefined if the row is impossible (negative height)
function cost(
  photos: readonly Photo[],
  i: number,
  j: number,
  width: number,
  spacing: number,
  padding: number,
  targetRowHeight: number,
) {
  const row = photos.slice(i, j);
  const commonHeight = getCommonHeight(row, width, spacing, padding);
  return commonHeight > 0 ? (commonHeight - targetRowHeight) ** 2 * row.length : undefined;
}

// compute optimal row breaks using dynamic programming on the DAG of possible row configurations
//
// the problem is modeled as finding the shortest path in a DAG where:
// - nodes are photo indices 0..N (break points between rows)
// - an edge from i to j means photos[i..j) form a row
// - edge weight is the weighted squared deviation from targetRowHeight
//
// since edges only go forward (i < j), nodes in topological order are simply 0, 1, ..., N
// and we can find the shortest path with a single forward pass (no priority queue needed)
export default function computeRowsLayout<TPhoto extends Photo>(
  photos: readonly TPhoto[],
  spacing: number,
  padding: number,
  containerWidth: number,
  targetRowHeight: number,
  minPhotos?: number,
  maxPhotos?: number,
): LayoutModel<TPhoto> | undefined {
  const maxPerRow = Math.min(
    findMaxPhotosPerRow(photos, containerWidth, targetRowHeight, minPhotos),
    maxPhotos || Infinity,
  );
  const minPerRow = minPhotos || 1;

  const n = photos.length;

  // dp[j] = minimum cost to lay out photos 0..j-1 into rows
  const dp = new Array(n + 1).fill(Infinity);
  // prev[j] = the previous break point in the optimal layout ending at j
  const prev = new Array(n + 1).fill(-1);
  dp[0] = 0;

  for (let j = 1; j <= n; j += 1) {
    // try all valid row endings at j, starting from the shortest row (fewest photos)
    // and growing longer; once a row has negative height (too many photos for the
    // container width), all longer rows will too, so we can break early
    for (let i = j - minPerRow; i >= Math.max(0, j - maxPerRow); i -= 1) {
      // skip unreachable break points (no valid layout reaches i)
      if (dp[i] === Infinity) continue;

      const c = cost(photos, i, j, containerWidth, spacing, padding, targetRowHeight);

      // impossible row (negative height) — longer rows will also be impossible
      if (c === undefined) break;

      const newCost = dp[i] + c;

      // deterministic tiebreaker to guard against edge cases where cost difference can be
      // as low as 1e-12, which leads to visual flickering during subsequent re-renders as
      // layout continues to shift back and forth
      if (
        dp[j] === Infinity ||
        (dp[j] > newCost && (dp[j] / newCost > TIEBREAKER_EPSILON || (prev[j] !== -1 && prev[j] < i)))
      ) {
        dp[j] = newCost;
        prev[j] = i;
      }
    }
  }

  // impossible layout — no valid way to arrange all photos into rows
  if (dp[n] === Infinity) return undefined;

  // reconstruct the optimal row breaks
  const path: number[] = [];
  for (let node = n; node !== 0; node = prev[node]) {
    path.push(node);
  }
  path.push(0);
  path.reverse();

  const tracks = [];

  for (let i = 1; i < path.length; i += 1) {
    const row = photos.slice(path[i - 1], path[i]).map((photo, j) => ({ photo, index: path[i - 1] + j }));
    const height = getCommonHeight(
      row.map(({ photo }) => photo),
      containerWidth,
      spacing,
      padding,
    );
    tracks.push({
      photos: row.map(({ photo, index }) => ({
        photo,
        index,
        width: height * ratio(photo),
        height,
      })),
    });
  }

  return { spacing, padding, containerWidth, tracks, horizontal: true };
}
