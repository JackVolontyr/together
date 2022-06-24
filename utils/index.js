module.exports = {
	leanHelper: (data, callback) => data.lean().exec((error, body) => {
		if (error) throw error;
		callback(body);
	}),

	setUser: (request, value) => {
		request.session.user = value;
		request.session.isAuthWithUserId = value._id || value;
	},

	isAuthor: (request, id) => request.session.isAuthWithUserId && request.session.isAuthWithUserId.equals(id),

	getMessages: errors => errors.array().map(item => item.msg),

	toProposalsPath: '/proposals',
	toLoginPath: '/login',
	toRegistrationPath: '/login#registration',
	toResetPasswordPath: '/login/reset-password',
	toSetNewPasswordPath: '/login/set-new-password',

	goToProposals: response => response.redirect('/proposals'),
	goToLogin: response => response.redirect('/login'),
	goToRegistration: response => response.redirect('/login#registration'),
	goToResetPassword: response => response.redirect('/login/reset-password'),
	goToHome: response => response.redirect('/'),
};