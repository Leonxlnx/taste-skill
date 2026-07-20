import PropTypes from 'prop-types';

import optgroupShape from './optgroupShape.js';
import optionShape from './optionShape.js';

export default PropTypes.arrayOf(
    PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        optgroupShape,
        optionShape,
    ]),
);
