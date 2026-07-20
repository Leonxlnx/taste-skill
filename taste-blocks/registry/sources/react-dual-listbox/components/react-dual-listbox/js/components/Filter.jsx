import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { LanguageContext } from '../contexts.js';

const propTypes = {
    controlKey: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    filterValue: PropTypes.string.isRequired,
    onFilterChange: PropTypes.func.isRequired,
};

function Filter(props) {
    const {
        controlKey,
        disabled,
        filterValue,
        onFilterChange,
    } = props;
    const {
        [`${controlKey}FilterPlaceholder`]: filterPlaceholder,
        [`${controlKey}FilterHeader`]: filterHeader,
    } = useContext(LanguageContext);

    return (
        <input
            aria-label={filterHeader}
            className="rdl-filter"
            data-control-key={controlKey}
            disabled={disabled}
            placeholder={filterPlaceholder}
            type="search"
            value={filterValue}
            onChange={onFilterChange}
        />
    );
}

Filter.propTypes = propTypes;

export default Filter;
