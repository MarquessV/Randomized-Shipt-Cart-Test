const fs = require('fs');
credentialsPath = './credentials.json';
configPath = './config.json';
var credentialsParsed = JSON.parse(fs.readFileSync(credentialsPath, 'UTF-8'));
var configParsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
exports.credentials = credentialsParsed;
exports.config = configParsed;
