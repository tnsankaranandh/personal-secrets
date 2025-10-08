'use strict';

const dotenv = require("dotenv");
dotenv.config();

const { connectDB } = require("./utils");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const UserAPI = require("./user");
const FolderAPI = require("./folder");
const ItemAPI = require("./item");

const app = express();

// Create application/x-www-form-urlencoded parser
bodyParser.urlencoded({ extended: false });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

const allowedOrigins = [
    'http://localhost:8000',
    'https://personal-secrets.vercel.app',
];
// Define CORS options
const corsOptions = {
    origin: function (origin: string | null, callback: Function) {
    	console.log('origin ', origin);
        // Check if the requesting origin is in the allowedOrigins array
        // or if the origin is undefined (e.g., for direct server requests or Postman)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Deny the request
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    allowedHeaders: ['X-Session-Data', 'x-session-data'], // Define allowed request headers
    exposedHeaders: ['X-Session-Data', 'x-session-data'], // Define headers exposed to the client
    credentials: true, // Allow sending cookies/credentials
    optionsSuccessStatus: 200 // Some legacy browsers require 200 for OPTIONS
};
app.use(cors(corsOptions));


const routesToIgnoreSessionValidation = [
	'/authenticateUser',
	'/.well-known/appspecific/com.chrome.devtools.json'
];
const validateSessionFilter = async (req: any, res: any, next: any) => {
	try {
		console.log('Route received in server is:');
		console.log(req.originalUrl);
		if (routesToIgnoreSessionValidation.indexOf(req.originalUrl) === -1) {
			const decodedSession: any = await jwt.verify(req.headers['x-session-data'], process.env.JWT_SECRET);
			console.log('session created at : ', new Date(decodedSession.iat));
			console.log('session expires at : ', new Date(decodedSession.exp));
			console.log('decodedSession : ', decodedSession);
		}
		next();
	} catch (e) {
		console.error(e);
		res.status(500).send({
			errorMessage:'Invalid Session!',
			isSessionInvalid: true,
		});
	}
};

const connectDBFilter = async (req: any, res: any, next: any) => {
	try {
		await connectDB();
        next();
	} catch (error) {
		console.error(error);
		res.status(500).send({ errorMessage: 'Error while connecting DB' });
	}
};

app.post('/authenticateUser', validateSessionFilter, connectDBFilter, UserAPI.authenticate);
app.get('/folders/list', validateSessionFilter, connectDBFilter, FolderAPI.list);
app.post('/folder/create', validateSessionFilter, connectDBFilter, FolderAPI.create);
app.put('/folder/update', validateSessionFilter, connectDBFilter, FolderAPI.update);
app.get('/folder/:folderUid', validateSessionFilter, connectDBFilter, FolderAPI.detail);
app.delete('/folder/delete/:folderUid', validateSessionFilter, connectDBFilter, FolderAPI.deleteFolder);
app.get('/items/list/:folderUid', validateSessionFilter, connectDBFilter, ItemAPI.list);
app.post('/item/create', validateSessionFilter, connectDBFilter, ItemAPI.create);
app.put('/item/update', validateSessionFilter, connectDBFilter, ItemAPI.update);
app.get('/item/:itemUid', validateSessionFilter, connectDBFilter, ItemAPI.detail);
app.delete('/item/delete/:itemUid', validateSessionFilter, connectDBFilter, ItemAPI.deleteItem);
app.post('/user/create', validateSessionFilter, connectDBFilter, UserAPI.create);
app.get('/user/:userUid', validateSessionFilter, connectDBFilter, UserAPI.detail);
app.put('/user/update', validateSessionFilter, connectDBFilter, UserAPI.update);

app.post('/item/getSecuredFieldValue', validateSessionFilter, connectDBFilter, ItemAPI.getSecuredFieldValue);
app.post('/item/decrypt', validateSessionFilter, connectDBFilter, ItemAPI.decrypt);


app.all('*', (req: any, res: any) => res.redirect('/login'));

app.use(function(error: any, request: any, response: any, next: any) {
	console.error(error);
    response.status(500).send(error.message || 'Internal Server Error');
});


app.listen(8000, () => { console.log('Server ready on port 8000.')} );

module.exports = app;


/*import * as bcrypt from 'bcryptjs';
async function logs() {
	console.log('viewer - ', await bcrypt.hash('viewer', await bcrypt.genSalt(10)));
	console.log('creator - ', await bcrypt.hash('creator', await bcrypt.genSalt(10)));
	console.log('admin - ', await bcrypt.hash('admin', await bcrypt.genSalt(10)));
};
logs();*/


// const utils=require("./utils");
// async function logs () {
// 	console.log(await utils.decryptText("69a0479202c979614c184db6e58e7420:725493dd08e5ac7a9e9fc46571b44522")); 
// };
// logs();