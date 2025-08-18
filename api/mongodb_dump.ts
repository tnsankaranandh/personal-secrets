console.log("mongodb dump file triggerred!!!!!!!!!");

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define your database details and output path
const dbName = 'secrets-db';
const dumpDir = path.join(__dirname, 'db_dumps'); // Directory to store dumps
const dumpFileName = `${dbName}_${Date.now()}.gz`; // Unique filename for the dump
const dumpFilePath = path.join(dumpDir, dumpFileName);


const backupDB: Function = () => {
    console.log("mongodb dump file function triggerred!!!!!!!!!");

    // Ensure the dump directory exists
    if (!fs.existsSync(dumpDir)) {
        fs.mkdirSync(dumpDir);
    }

    // Construct the mongodump command
    // --archive creates a single archive file, --gzip compresses it
    const mongodumpCommand = `mongodump --db ${dbName} --archive=${dumpFilePath} --gzip`;

    exec(mongodumpCommand, (error: any, stdout: any, stderr: any) => {
        if (error) {
            console.error(`mongodump exec error: ${error}`);
            return;
        }
        console.log(`MongoDB dump created: ${dumpFilePath}`);
        exec('ls', (errorLS: any, stdoutLS: any, stderrLS: any) => {
            if (errorLS) {
                console.error(`ls exec error: ${errorLS}`);
                return;
            }
            console.log(`ls result: ${stdoutLS}`);
        });
    });
};

module.exports = {
    backupDB,
};