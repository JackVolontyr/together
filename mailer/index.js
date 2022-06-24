const nodemailer = require('nodemailer');
const { 
	registrationOption, registrationOptionToModerator, resetPasswordOption
} = require('./views');

const sendMail = (action, options) => {
	const { email, firstName, lastName, route, resetPasswordToken } = options;
	const { MODERATOR_EMAIL, BASE_URL: baseUrl } = process.env;
	let standartOptions = { email, firstName, lastName, baseUrl };
	let callback = () => {};

	let mailOptions = { from: MODERATOR_EMAIL, to: email };
	let mailOptionsToModerator = { from: MODERATOR_EMAIL, to: MODERATOR_EMAIL };

	const transporter = nodemailer.createTransport({
		service: process.env.MAIL_SERVICE,
		secure: true,
		auth: {
			type: process.env.CLIENT_TYPE,
			user: process.env.MAIL_USERNAME,
			pass: process.env.MAIL_PASSWORD,
			clientId: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			refreshToken: process.env.REFRESH_TOKEN
		}
	});

	switch (action) {
		case 'registration':
			mailOptions = { 
				...mailOptions, 
				...registrationOption(standartOptions)
			};

			callback = data => transporter.sendMail({ 
				...mailOptionsToModerator, 
				...registrationOptionToModerator(standartOptions)
			});
			
			break;

		case 'reset-password':
			mailOptions = { 
				...mailOptions, 
				...resetPasswordOption({ ...standartOptions, route, resetPasswordToken })
			}
			break;

		default:
			console.log('Error: incorrect mailer action.'); 
			return;
	}

	transporter.sendMail(mailOptions)
		.then(callback)
		.catch(error => console.log(error));
}

module.exports = { sendMail }