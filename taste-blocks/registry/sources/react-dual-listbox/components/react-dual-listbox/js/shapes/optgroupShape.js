import PropTypes from 'prop-types';

import optionShape from './optionShape.js';

export default PropTypes.shape({
    options: PropTypes.arrayOf(optionShape).isRequired,

    // Optional properties
    disabled: PropTypes.bool,
    label: PropTypes.node,
    title: PropTypes.string,
});
