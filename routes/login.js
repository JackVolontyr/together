const { Router } = require("express");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");

const { goToHome, toLoginPath, goToLogin, getMessages, toRegistrationPath, setUser } = require("../utils");
const { loginValidators, registrationValidators } = require("../utils/validators");

const User = require("../models/User");

const router = Router();

/**
 * GET /login
 */
router.get('/', (request, response) => {
	response.render('login', {
		registrationAlerts: request.flash('registrationAlerts'),
		loginAlerts: request.flash('loginAlerts'),
		successLoginAlerts: request.flash('successLoginAlerts'),
		
		title: 'Log in page',
		isLogin: true
	});
});

/** 
 * POST /login 
*/
router.post('/', loginValidators, async (request, response) => {
	try {
		const { email } = request.body;

		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			request.flash('loginAlerts', getMessages(errors));
			return response.status(422).redirect(toLoginPath);
		}

		const user = await User.findOne({ email });
		setUser(request, user);

		request.session.save(error => {
			if (error) throw error;
			goToHome(response);
		});

	} catch (error) { console.log(error); }
});

/**
 * GET /login/logout
 */
router.get('/logout', (request, response) => request.session.destroy(_ => goToHome(response)));

/**
 * POST /login/registration
 */
router.post('/registration', registrationValidators, async (request, response) => {
	try {
		const { email, password, firstName, lastName } = request.body;

		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			request.flash('registrationAlerts', getMessages(errors));
			return response.status(422).redirect(toRegistrationPath);
		}
		
		const hashPassword = await bcryptjs.hash(password, 10);
		const user = new User({ email, password: hashPassword, firstName, lastName });
		await user.save();
		request.flash('successLoginAlerts', 'User successfully created!');
		goToLogin(response);

	} catch (error) { console.log(error); }
});

module.exports = router;