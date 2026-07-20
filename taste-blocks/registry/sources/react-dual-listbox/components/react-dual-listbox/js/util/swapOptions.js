/**
 * Return a function to swap positions of the given indexes in an ordering.
 *
 * @param {int} index1
 * @param {int} index2
 *
 * @returns {function}
 */
export default (index1, index2) => (
    (options) => {
        const newOptions = [...options];

        [newOptions[index1], newOptions[index2]] = [
            newOptions[index2],
            newOptions[index1],
        ];

        return newOptions;
    }
);
