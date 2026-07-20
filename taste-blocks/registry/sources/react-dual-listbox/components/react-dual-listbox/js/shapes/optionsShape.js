import PropTypes from 'prop-types';

import optgroupShape from './optgroupShape.js';
import optionShape from './optionShape.js';

export default PropTypes.arrayOf(
    PropTypes.oneOfType([
        optgroupShape,
        optionShape,
    ]),
);
