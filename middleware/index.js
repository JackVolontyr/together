const User = require("../models/User");
const { goToLogin } = require("../utils");

module.exports = {
	setAuth: (request, response, next) => {
		response.locals.isAuthWithUserId = request.session.isAuthWithUserId;
		response.locals.csrf = request.csrfToken();
		next();
	},

	checkAuth: (request, response, next) => {
		if (!request.session.isAuthWithUserId) return goToLogin(response);
		next();
	},

	passUser: async (request, _, next) => {
		if (!request.session.user) return next();
		request.user = await User.findById(request.session.user._id);
		next();
	},

	errorPage: (_, response) => {
		response.status(404).render('404', { title: 'Page not found' });
	},
};