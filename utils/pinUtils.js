/**
 * Calculate the expiration date for a pin based on the role name.
 * @param {string} roleName - The name of the role.
 * @returns {Date|null} - The calculated expiration date or null if the role name is invalid.
 */
function calculateExpirationDate(roleName) {
    let newExpirationDate = new Date();
    switch (roleName.toLowerCase()) {
        case 'special 1m':
            newExpirationDate.setDate(newExpirationDate.getDate() + 30);
            break;
        case 'special 3m':
            newExpirationDate.setDate(newExpirationDate.getDate() + 90);
            break;
        case 'special 1y':
            newExpirationDate.setDate(newExpirationDate.getDate() + 365);
            break;
        case 'special lifetime':
            // Set a distant future date for "lifetime" roles
            newExpirationDate = new Date('2099-12-31');
            break;
        default:
            console.warn(`Invalid role name provided: ${roleName}`);
            return null;
    }
    return newExpirationDate;
}

module.exports = { calculateExpirationDate };
