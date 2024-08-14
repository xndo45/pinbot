require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');
const fs = require('fs');
const Pin = require('./models/pinModel'); // Adjust the path to where your model is located

async function logPinsWithLetters() {
    try {
        // Connect to your MongoDB database using the connection string from .env
        await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        console.log('Connected to MongoDB.');

        // Find all pins that contain letters
        const regex = /[a-zA-Z]/; // Regex to match any letter
        const pinsWithLetters = await Pin.find({ pin: { $regex: regex } });

        const totalPins = await Pin.countDocuments(); // Total number of pins in the database
        const totalPinsWithLetters = pinsWithLetters.length; // Total number of pins with letters

        if (totalPinsWithLetters === 0) {
            console.log('No pins with letters found.');
            return;
        }

        // Count pins with letters by roleName
        const roleNameCounts = {};
        pinsWithLetters.forEach(pin => {
            const roleName = pin.roleName || 'Unknown'; // Use 'Unknown' if roleName is missing
            if (!roleNameCounts[roleName]) {
                roleNameCounts[roleName] = 0;
            }
            roleNameCounts[roleName]++;
        });

        // Prepare log data
        let logData = `Total Pins in Database: ${totalPins}\n`;
        logData += `Total Pins with Letters: ${totalPinsWithLetters}\n\n`;

        logData += `Pins with Letters by RoleName:\n`;
        for (const [roleName, count] of Object.entries(roleNameCounts)) {
            logData += `${roleName}: ${count}\n`;
        }
        logData += `\nDetailed List of Pins with Letters:\n\n`;

        for (let pin of pinsWithLetters) {
            logData += `Pin: ${pin.pin}\nUserId: ${pin.userId}\nUserTag: ${pin.userTag}\nRoleName: ${pin.roleName}\nExpirationDate: ${pin.expirationDate}\n\n`;

            // Optionally, update the database record (e.g., adding a flag or updating metadata)
            pin.metadata = pin.metadata || {};
            pin.metadata.containsLetters = true; // Flag to indicate that this pin contains letters
            await pin.save(); // Ensure save operation completes before moving to the next pin
        }

        // Write the log data to a file
        fs.writeFileSync('pins_with_letters.log', logData);

        console.log('Log file created: pins_with_letters.log');
    } catch (error) {
        console.error('Error processing pins:', error);
    } finally {
        // Disconnect from the database only after all operations are complete
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

// Run the script
logPinsWithLetters();
