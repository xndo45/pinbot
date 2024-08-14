// services/validationService.js
module.exports = {
    validatePinFormat(pin) {
        const pinRegex = /^\d{8,15}$/;
        return pinRegex.test(pin);
    }
};
