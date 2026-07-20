/**
 * Capitalize the first letter of a given string.
 *
 * @param {string} str
 *
 * @returns {string}
 */
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default capitalizeFirstLetter;
