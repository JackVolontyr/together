const bcryptjs = require("bcryptjs");
const { body } = require("express-validator");
const User = require("../models/User");

const userValidators = [
	body('firstName', 'First name must be at least 1 character long.').isLength({ min: 1, max: 36 }).trim(),
	body('lastName', 'Last name must be at least 1 character long.').isLength({ min: 1, max: 36 }).trim(),
];

const emailNotExistValidators = [
	body('email', 'Invalid value of param: email.').isEmail().custom(async (value) => {
		try {
			const candidate = await User.findOne({ email: value });
			if (!candidate) return Promise.reject('This email does not exist.');
			
		} catch (error) { console.log(error); }
	}).normalizeEmail(),
];

const confirmPasswordValidators = [
	body('confirm').custom((value, { req }) => {
		if (value !== req.body.password) throw new Error('Passwords do not match.');
		return true;
	}).trim(),
];

exports.userValidators = [ ...userValidators ];

exports.proposalValidators = [
	body('title', 'Title must be at least 2 character long.').isLength({ min: 2, max: 150 }).trim(),
	body('comment', 'Comment must be at least 2 character long.').isLength({ min: 2, max: 1500 }).trim(),
];

exports.emailNotExistValidators = [ ...emailNotExistValidators ];
exports.confirmPasswordValidators = [ ...confirmPasswordValidators ];

exports.loginValidators = [
	...emailNotExistValidators,
	
	body('password', 'Password must be at least 1 character long.').isLength({ min: 1, max: 36 }).custom(async (value, {req}) => {
		try {
			const candidate = await User.findOne({ email: req.body.email });
			if (!candidate) return false;
			const isPass = await bcryptjs.compare(value, candidate.password);
			if (!isPass) return Promise.reject('Password is incorrect.');

		} catch (error) { console.log(error); }
	}).trim(),
];

exports.registrationValidators = [
	body('email', 'Invalid value of param: email.').isEmail().custom(async (value) => {
		try {
			const candidate = await User.findOne({ email: value });
			if (candidate) return Promise.reject('This email exists already.');
			
		} catch (error) { console.log(error); }
	}).normalizeEmail(),
	
	...confirmPasswordValidators,
	body('password', 'Password must be at least 1 character long.').isLength({min: 1, max: 36}).trim(),
	...userValidators
];