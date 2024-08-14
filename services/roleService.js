// services/roleService.js
module.exports = {
    getRoleDetails(roleName) {
        let expirationDate;
        switch (roleName.toLowerCase()) {
            case 'special 1m':
                expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 30);
                break;
            case 'special 3m':
                expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 90);
                break;
            case 'special 1y':
                expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 365);
                break;
            case 'special lifetime':
                expirationDate = new Date('2099-12-31');
                break;
            default:
                return null; // Invalid role
        }
        return { expirationDate };
    }
};
