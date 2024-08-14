const Pin = require('../models/pinModel');
const ArchivedPin = require('../models/archivedPinModel'); // Assuming you have an archived pin model
const Notification = require('../models/notificationModel');

const archiveOldPins = async () => {
    try {
        const expiredPins = await Pin.find({ expirationDate: { $lt: new Date() } });

        if (expiredPins.length > 0) {
            // Archive expired pins
            const archivedPins = expiredPins.map(pin => ({
                ...pin.toObject(),
                archivedAt: new Date()
            }));
            await ArchivedPin.insertMany(archivedPins);

            // Delete expired pins
            await Pin.deleteMany({ expirationDate: { $lt: new Date() } });

            // Notify about the archiving
            const notifications = expiredPins.map(pin => ({
                userId: pin.userId,
                message: `Your pin ${pin.pin} has been archived.`,
                sendAt: new Date(),
                isSent: false
            }));
            await Notification.insertMany(notifications);

            console.log(`Archived ${expiredPins.length} pins and sent notifications.`);
        } else {
            console.log('No expired pins to archive.');
        }
    } catch (error) {
        console.error('Error archiving old pins:', error);
    }
};

module.exports = archiveOldPins;
