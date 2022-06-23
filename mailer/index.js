const nodemailer = require('nodemailer');
const { registrationOption } = require('./views');

const sendMail = (action, options) => {
	const { email, firstName, lastName } = options;

	let mailOptions = { from: process.env.MODERATOR_EMAIL, to: email };

	const transporter = nodemailer.createTransport({
		service: process.env.MAIL_SERVICE,
		auth: {
			type: process.env.CLIENT_TYPE,
			user: process.env.MAIL_USERNAME,
			pass: process.env.MAIL_PASSWORD,
			clientId: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			refreshToken: process.env.REFRESH_TOKEN
		}
	});

	const mailerCallback = (error, data) => {
		if (error) { console.log("Error " + error); } else { console.log("Email sent successfully"); }
	}

	switch (action) {
		case 'registration':
			mailOptions = { 
				...mailOptions, 
				...registrationOption({ email, firstName, lastName, baseUrl: process.env.BASE_URL })
			}
			break;
	
		default:
			console.log('Error: incorrect mailer action.'); 
			return;
	}

	transporter.sendMail(mailOptions, mailerCallback);
}

module.exports = {
	sendMail
}