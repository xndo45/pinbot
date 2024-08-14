require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');
const Pin = require('./models/pinModel'); // Adjust the path to where your model is located

async function updateExistingRecords() {
    try {
        // Connect to your MongoDB database using the connection string from .env
        await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        console.log('Connected to MongoDB.');

        // Fetch all existing pins
        const pins = await Pin.find({});

        for (let pin of pins) {
            // Set default values if required fields are missing
            if (!pin.roleId) {
                pin.roleId = 'defaultRoleId'; // Replace with an appropriate default value
            }

            if (!pin.roleName) {
                pin.roleName = 'defaultRoleName'; // Replace with an appropriate default value
            }

            if (!pin.status) {
                pin.status = 'active'; // Set default status
            }

            if (!pin.metadata) {
                pin.metadata = {}; // Set default metadata
            }

            if (!pin.createdAt) {
                pin.createdAt = pin._id.getTimestamp(); // Set createdAt based on the ObjectId timestamp
            }

            if (!pin.updatedAt) {
                pin.updatedAt = new Date(); // Set updatedAt to the current date
            }

            // Save the updated pin back to the database
            await pin.save();
        }

        console.log('Database records updated successfully.');
    } catch (error) {
        console.error('Error updating records:', error);
    } finally {
        // Disconnect from the database
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

// Run the update script
updateExistingRecords();
