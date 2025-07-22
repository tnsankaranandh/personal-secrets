require('dotenv').config();


const connectDB = require('./database');

const express = require('express');
const app = express();
const { sql } = require('@vercel/postgres');

const bodyParser = require('body-parser');
const path = require('path');

// Create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static('public'));

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, '..', 'components', 'home.htm'));
});

app.get('/about', function (req, res) {
	res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'));
});

// app.get('/uploadUser', function (req, res) {
// 	res.sendFile(path.join(__dirname, '..', 'components', 'user_upload_form.htm'));
// });

// app.post('/uploadSuccessful', urlencodedParser, async (req, res) => {
// 	try {
// 		await sql`INSERT INTO Users (Id, Name, Email) VALUES (${req.body.user_id}, ${req.body.name}, ${req.body.email});`;
// 		res.status(200).send('<h1>User added successfully</h1>');
// 	} catch (error) {
// 		console.error(error);
// 		res.status(500).send('Error adding user');
// 	}
// });

app.get('/allUsers', async (req, res) => {
	try {
		await connectDB();
	} catch (error) {
		console.error(error);
		res.status(500).send('Error connecting DB');
	}
});

app.listen(8000, () => console.log('Server ready on port 8000.'));

module.exports = app;
