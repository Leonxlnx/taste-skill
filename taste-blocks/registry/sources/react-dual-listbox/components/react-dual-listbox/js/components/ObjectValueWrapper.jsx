import React, { useCallback } from 'react';

import DualListBox, { propTypes } from './DualListBox.jsx';

/**
 * Flatten an array of options to a simple list of values.
 *
 * @param {Array} options
 * @param {function} getOptionValue
 *
 * @returns {Array}
 */
function flattenOptions(options, getOptionValue) {
    const flattened = [];

    options.forEach((option) => {
        const value = getOptionValue(option);

        if (value !== undefined) {
            // Flatten single-level options
            flattened.push(value);
        } else if (option.options !== undefined) {
            // Flatten optgroup options
            option.options.forEach((subOption) => {
                flattened.push(getOptionValue(subOption));
            });
        }
    });

    return flattened;
}

function ObjectValueWrapper(props) {
    const {
        available,
        getOptionValue,
        options,
        selected,
        onChange,
    } = props;

    const simpleAvailable = available ? flattenOptions(available, getOptionValue) : undefined;
    const simpleSelected = flattenOptions(selected, getOptionValue);

    const simpleOnChange = useCallback((newSelected, userSelection, controlKey) => {
        const sourceValues = { selected: newSelected };
        const complexValues = { selected: [] };

        // Reconstruct option objects for both the selected values and user selection
        Object.keys(sourceValues).forEach((key) => {
            // Note that complex values become expensive if there are several options
            sourceValues[key].forEach((value) => {
                options.forEach((option) => {
                    const optionValue = getOptionValue(option);

                    if (optionValue) {
                        // Reconstruct single-level option
                        if (optionValue === value) {
                            complexValues[key].push(option);
                        }
                    } else {
                        // Reconstruct optgroup options with those children
                        const subSelected = [];
                        option.options.forEach((subOption) => {
                            if (getOptionValue(subOption) === value) {
                                subSelected.push(subOption);
                            }
                        });

                        if (subSelected.length > 0) {
                            complexValues[key].push({
                                ...option,
                                options: subSelected,
                            });
                        }
                    }
                });
            });
        });

        onChange(complexValues.selected, userSelection, controlKey);
    }, [getOptionValue, options]);

    /* eslint-disable react/jsx-props-no-spreading */
    return (
        <DualListBox
            {...props}
            available={simpleAvailable}
            selected={simpleSelected}
            onChange={simpleOnChange}
        />
    );
    /* eslint-enable */
}

ObjectValueWrapper.propTypes = propTypes;

export default ObjectValueWrapper;
