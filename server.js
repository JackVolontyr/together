const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const expressHbs = require("express-handlebars");
const session = require('express-session');
const csrf = require("csurf");
const flash = require("connect-flash");
const MongoDBStore = require('connect-mongodb-session')(session);
const helmet = require("helmet");
const compression = require("compression");
const dotenv = require('dotenv');
dotenv.config();

const { setAuth, passUser, errorPage } = require("./middleware");
const fileMiddleware = require("./middleware/fileMiddleware");

// const keys = require("./keys");

const app = express();

const store = new MongoDBStore({ uri: process.env.MONGO_DB_URI, collection: 'sessions' });

// HBs
const hbs = expressHbs.create({
	helpers: {
		eq: function(a, b, options) { return a == b ? options.fn(this) : options.inverse(this); }
	}, 
	defaultLayout: 'main',
	extname: 'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

// Use
app.use(express.static(path.join(__dirname, 'public')));
app.use('/imgs', express.static(path.join(__dirname, 'imgs')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
	store,
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	//cookie: { secure: true }
}));
app.use(fileMiddleware.single('avatarUrl'));
app.use(csrf());
app.use(flash());
app.use(helmet());
app.use(compression());
app.use(setAuth);
app.use(passUser);

// Routes
app.use('/', require("./routes/home"));
app.use('/proposals', require("./routes/proposals"));
app.use('/contacts', require("./routes/contacts"));
app.use('/login', require("./routes/login"));
app.use('/users', require("./routes/users"));
app.use(errorPage);

// Start
async function start(uri) {
	try {
		// MongoDB
		await mongoose.connect(uri, { useNewUrlParser: true });

		const PORT = process.env.PORT || 8080;
		app.listen(PORT, _ => { console.log(`Server starts on port: ${PORT}.`); });

	} catch (error) { console.log(error);	}
}

start(process.env.MONGO_DB_URI);