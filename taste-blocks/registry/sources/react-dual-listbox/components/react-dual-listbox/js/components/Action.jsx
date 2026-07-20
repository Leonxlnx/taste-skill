import classNames from 'classnames';
import kebabCase from 'lodash/kebabCase';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { IconContext, LanguageContext } from '../contexts.js';
import capitalizeFirstLetter from '../util/capitalizeFirstLetter.js';

const propTypes = {
    direction: PropTypes.oneOf([
        'toAvailable',
        'toSelected',
        'up',
        'down',
        'top',
        'bottom',
    ]).isRequired,
    disabled: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,

    isMoveAll: PropTypes.bool,
};

function Action({
    direction,
    disabled,
    onClick: parentOnClick,
    isMoveAll = false,
}) {
    function onClick() {
        parentOnClick({ direction, isMoveAll });
    }

    function getActionKey() {
        return `move${isMoveAll ? 'All' : ''}${capitalizeFirstLetter(direction)}`;
    }

    const actionKey = getActionKey();
    const { [actionKey]: icon } = useContext(IconContext);
    const { [actionKey]: label } = useContext(LanguageContext);
    const classKey = kebabCase(actionKey);
    const className = classNames({
        'rdl-btn': true,
        'rdl-move': true,
        [`rdl-${classKey}`]: true,
    });

    return (
        <button
            aria-label={label}
            className={className}
            disabled={disabled}
            title={label}
            type="button"
            onClick={onClick}
        >
            {icon}
        </button>
    );
}

Action.propTypes = propTypes;

export default Action;
