import { useState } from "react";

export default function useArray<T>(array: readonly T[] | undefined) {
  const [state, setState] = useState(array);

  if (
    array !== state &&
    (!array || !state || array.length !== state.length || array.some((el, i) => el !== state[i]))
  ) {
    setState(array);
    return array;
  }

  return state;
}
