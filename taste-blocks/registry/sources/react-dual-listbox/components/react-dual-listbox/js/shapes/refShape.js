import PropTypes from 'prop-types';

const elementType = typeof Element === 'undefined' ? () => {} : Element;
const refShape = PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(elementType) }),
]);

export default refShape;
