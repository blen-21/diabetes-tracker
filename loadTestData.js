const mongoose = require('mongoose');
const fs = require('fs');
const { User, SugarLog, ExerciseLog, MedicationLog } = require('./src/mongodb'); // Import models

mongoose.connect('mongodb://localhost:27017/diabetes-database', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

const loadTestData = async () => {
    try {
        // Read data from JSON file
        const data = JSON.parse(fs.readFileSync('sampleData.json', 'utf8'));

        // Insert User data
        const users = await User.insertMany(data.users);
        console.log("Users loaded:", users);

        // Map user name to user ID for reference in other logs
        const userMap = {};
        users.forEach(user => {
            userMap[user.name] = user._id;
        });

        // Insert SugarLog data, associating with user ID
        const sugarLogs = data.sugarLogs.map(log => ({
            ...log,
            user: userMap[log.user] // Convert user name to ObjectId
        }));
        const insertedSugarLogs = await SugarLog.insertMany(sugarLogs);
        console.log("Sugar Logs loaded:", insertedSugarLogs);

        // Insert ExerciseLog data, associating with user ID
        const exerciseLogs = data.exerciseLogs.map(log => ({
            ...log,
            user: userMap[log.user] // Convert user name to ObjectId
        }));
        const insertedExerciseLogs = await ExerciseLog.insertMany(exerciseLogs);
        console.log("Exercise Logs loaded:", insertedExerciseLogs);

        // Insert MedicationLog data, associating with user ID
        const medicationLogs = data.medicationLogs.map(log => ({
            ...log,
            user: userMap[log.user] // Convert user name to ObjectId
        }));
        const insertedMedicationLogs = await MedicationLog.insertMany(medicationLogs);
        console.log("Medication Logs loaded:", insertedMedicationLogs);

        console.log("Test data loaded successfully.");
    } catch (error) {
        console.error("Error loading test data:", error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the function to load test data
loadTestData();
