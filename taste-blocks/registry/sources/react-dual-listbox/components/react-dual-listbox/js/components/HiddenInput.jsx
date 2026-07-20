import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';

import refShape from '../shapes/refShape.js';
import valueShape from '../shapes/valueShape.js';
import { LanguageContext } from '../contexts.js';

const noop = () => {};
const propTypes = {
    availableRef: refShape.isRequired,
    disabled: PropTypes.bool.isRequired,
    required: PropTypes.bool.isRequired,
    selected: valueShape.isRequired,
    onFocus: PropTypes.func.isRequired,

    name: PropTypes.string,
};

function HiddenInput({
    availableRef,
    disabled,
    required,
    selected,
    onFocus,
    name = null,
}) {
    const { hiddenInputLabel, requiredError } = useContext(LanguageContext);

    useEffect(() => {
        if (!required) {
            return;
        }

        // If required, set a validity error when no options are selected
        const validity = selected.length === 0 ? requiredError : '';
        availableRef.current.setCustomValidity(validity);
    }, [selected]);

    const hiddenValue = selected.join(',');

    return (
        <input
            aria-label={hiddenInputLabel}
            className="rdl-hidden-input"
            disabled={disabled}
            name={name}
            required={required}
            type={required ? 'text' : 'hidden'}
            value={hiddenValue}
            onChange={noop}
            onFocus={onFocus}
        />
    );
}

HiddenInput.propTypes = propTypes;

export default HiddenInput;
