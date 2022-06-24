const { Router } = require("express");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const crypto = require("crypto");

const { 
	toLoginPath, toRegistrationPath, toResetPasswordPath, toSetNewPasswordPath,
	goToHome, goToLogin, getMessages, setUser, goToResetPassword
} = require("../utils");
const { loginValidators, registrationValidators, emailNotExistValidators, confirmPasswordValidators } = require("../utils/validators");

const User = require("../models/User");
const { sendMail } = require("../mailer");

const router = Router();

const BCRYPT_NUMBER = 10;

const toResetPasswordWithError = (req, res, errorInfo = false) => {
	req.flash('resetPasswordAlerts', errorInfo ? errorInfo : 'Something went wrong.');
	return res.status(422).redirect(toResetPasswordPath);
}

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
		
		const hashPassword = await bcryptjs.hash(password, BCRYPT_NUMBER);
		const user = new User({ email, password: hashPassword, firstName, lastName });
		await user.save();
		request.flash('successLoginAlerts', 'User successfully created!');
		goToLogin(response);
		await sendMail('registration', { email, firstName, lastName });

	} catch (error) { console.log(error); }
});

/**
 * GET /login/reset-password
 */
router.get('/reset-password', (request, response) => {
	response.render('login/reset_password', {
		resetPasswordAlerts: request.flash('resetPasswordAlerts'),

		title: 'Reset password',
		isLogin: true
	});
});

/**
 * POST /login/reset-password
 */
router.post('/reset-password', emailNotExistValidators, (request, response) => {
	try {
		const errors = validationResult(request);
		if (!errors.isEmpty()) toResetPasswordWithError(request, response, getMessages(errors));

		crypto.randomBytes(32, async (error, buffer) => {
			if (error) toResetPasswordWithError(request, response, 'Crypto error. Write to Moderator.');

			const resetPasswordToken = buffer.toString('hex');
			const oneHour = 60 * 60 * 1000;
			const { email } = request.body;
			const candidate = await User.findOne({ email });

			// Dobble chech
			if (candidate) {
				candidate.resetPasswordToken = resetPasswordToken;
				candidate.resetPasswordTokenExpiration = Date.now() + oneHour;
				await candidate.save();

				const { firstName, lastName } = candidate;
				const route = 'login/set-new-password';
				response.render('login/reset_password_info', {
					title: "Instructions have been sent to your email.",
					isLogin: true, 
					email 
				});
				await sendMail('reset-password', { email, firstName, lastName, route, resetPasswordToken });
			}
		});

	} catch (error) { console.log(error); }
});

/**
 * GET /login/set-new-password/:token
 */
router.get('/set-new-password/:token', async (request, response) => {
	try {
		const { token } = request.params;
		if (!token) toResetPasswordWithError(request, response, "Token not exists. Write to Moderator.");

		const candidate = await User.findOne({
			resetPasswordToken: token,
			resetPasswordTokenExpiration: {$gt: Date.now()}
		});

		if (!candidate) {
			toResetPasswordWithError(request, response, "User with this token not exists. Write to Moderator.");

		} else {
			response.render('login/set_new_password', {
				setNewPasswordAlerts: request.flash('setNewPasswordAlerts'),
		
				title: 'Set new password',
				isLogin: true,
				usedId: candidate._id,
				token
			});
		}

	} catch (error) { console.log(error); }
});

/**
 * POST /login/set-new-password/
 */
router.post('/set-new-password/', confirmPasswordValidators, async (request, response) => {
	try {
		const { usedId, token, password } = request.body;

		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			request.flash('setNewPasswordAlerts', getMessages(errors));
			return response.status(422).redirect(`${toSetNewPasswordPath}/${token}`);
		}

		const candidate = await User.findOne({
			_id: usedId,
			resetPasswordToken: token,
			resetPasswordTokenExpiration: {$gt: Date.now()}
		});

		if (candidate) {
			candidate.password = await bcryptjs.hash(password, BCRYPT_NUMBER);
			candidate.resetPasswordToken = undefined;
			candidate.resetPasswordTokenExpiration = undefined;
			await candidate.save();
			request.flash('successLoginAlerts', 'Password successfully changed!');
			goToLogin(response);

		} else {
			toResetPasswordWithError(request, response, 'User with this token not exists (2). Write to Moderator.');
		}

	} catch (error) { console.log(error); }
});

module.exports = router;