'use strict';

const dotenv = require("dotenv");
dotenv.config();

const { connectDB } = require("./database");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
// const path = require("path");
const jwt = require('jsonwebtoken');
const UserAPI = require("./user");
// const FolderAPI = require("./folder");
// const ItemAPI = require("./item");

const app = express();

// const getUIPageWithPath = (componentName: string) => path.join(__dirname, '..', 'components', componentName, 'index.htm');

// Create application/x-www-form-urlencoded parser
bodyParser.urlencoded({ extended: false });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// app.get('/', (req: any, res: any) => res.redirect('/login'));
// app.get('/login', (req: any, res: any) => res.sendFile(getUIPageWithPath('login')));
// app.get('/listSecrets', (req: any, res: any) => res.sendFile(getUIPageWithPath('listSecrets')));
// app.get('/createFolderModal', (req: any, res: any) => res.sendFile(getUIPageWithPath('createFolderModal')));
// app.get('/createItemModal', (req: any, res: any) => res.sendFile(getUIPageWithPath('createItemModal')));
// app.get('/createUserModal', (req: any, res: any) => res.sendFile(getUIPageWithPath('createUserModal')));

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
	'/login',
	'/.well-known/appspecific/com.chrome.devtools.json'
];
const validateSession = async (req: any, res: any, next: any) => {
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
		console.log(connectDB);
		await connectDB();
        next();
	} catch (error) {
		console.error(error);
		res.status(500).send({ errorMessage: 'Error while connecting DB' });
	}
};

app.post('/authenticateUser', validateSession, connectDBFilter, UserAPI.authenticate);
// app.get('/folders/list', validateSession, connectDBFilter, FolderAPI.list);
// app.post('/folder/create', validateSession, connectDBFilter, FolderAPI.create);
// app.get('/items/list/:folderUid', validateSession, connectDBFilter, ItemAPI.list);
// app.post('/item/create', validateSession, connectDBFilter, ItemAPI.create);
// app.get('/item/:itemUid', validateSession, connectDBFilter, ItemAPI.detail);
// app.post('/user/create', validateSession, connectDBFilter, UserAPI.create);


// app.all('*', (req: any, res: any) => res.redirect('/login/index.html'));

app.use(function(error: any, request: any, response: any, next: any) {
    // Handle the error
    console.log("internal error has occurred!!!!");
    console.log(error);
    response.status(500).send('Internal Server Error');
});


app.listen(8000, () => { console.log('Server ready on port 8000.')} );

module.exports = app;
