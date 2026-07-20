import { ratio } from "../../utils";
import type { LayoutModel, Photo } from "../../types";

export default function computeMasonryLayout<TPhoto extends Photo>(
  photos: readonly TPhoto[],
  spacing: number,
  padding: number,
  containerWidth: number,
  columns: number,
): LayoutModel<TPhoto> | undefined {
  // calculate column width based on total width and columns count
  const columnWidth = (containerWidth - spacing * (columns - 1) - 2 * padding * columns) / columns;

  // encountered impossible layout
  if (columnWidth <= 0) {
    // will try to find a solution recursively with fewer columns
    return columns > 1 ? computeMasonryLayout(photos, spacing, padding, containerWidth, columns - 1) : undefined;
  }

  // store current top positions for each column
  const columnsCurrentTopPositions: number[] = [];
  for (let i = 0; i < columns; i += 1) {
    columnsCurrentTopPositions[i] = 0;
  }

  // group photos by column
  const columnsModel = photos.reduce<{ photo: TPhoto; index: number }[][]>(
    (model, photo, index) => {
      // find the shortest column
      const shortestColumn = columnsCurrentTopPositions.reduce(
        (currentShortestColumn, item, i) =>
          // subtracting 1 here to compensate for floating point precision errors
          // when two columns have identical height their floating point values can be slightly off
          // in subsequent re-renders, leading to images jumping between columns
          item < columnsCurrentTopPositions[currentShortestColumn] - 1 ? i : currentShortestColumn,
        0,
      );

      // update top position of the shortest column
      columnsCurrentTopPositions[shortestColumn] =
        columnsCurrentTopPositions[shortestColumn] + columnWidth / ratio(photo) + spacing + 2 * padding;

      // place a photo into the shortest column
      model[shortestColumn].push({ photo, index });

      return model;
    },
    Array.from({ length: columns }, () => []),
  );

  // map through each column and photo and add layout properties
  return {
    spacing,
    padding,
    containerWidth,
    variables: { columns },
    tracks: columnsModel.map((column) => ({
      photos: column.map(({ photo, index }) => ({
        photo,
        index,
        width: columnWidth,
        height: columnWidth / ratio(photo),
      })),
    })),
  };
}
