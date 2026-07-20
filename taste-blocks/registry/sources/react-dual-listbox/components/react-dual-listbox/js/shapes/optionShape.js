import PropTypes from 'prop-types';

export default PropTypes.shape({
    disabled: PropTypes.bool,
    label: PropTypes.string,
    title: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});
