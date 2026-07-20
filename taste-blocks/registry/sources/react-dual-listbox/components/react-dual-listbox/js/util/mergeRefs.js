/**
 * Merge and set multiple refs for a component.
 *
 * @param {React.MutableRefObject[]} refs
 *
 * @return {Function}
 */
function mergeRefs(refs) {
    return (c) => {
        /* eslint-disable no-param-reassign */
        refs.forEach((ref) => {
            if (ref !== null) {
                if (typeof ref === 'function') {
                    ref(c);
                } else {
                    ref.current = c;
                }
            }
        });
        /* eslint-enable no-param-reassign */
    };
}

export default mergeRefs;
