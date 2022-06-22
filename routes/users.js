const { Router } = require("express");
const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");
const { checkAuth } = require("../middleware");
const User = require("../models/User");
const { leanHelper, isAuthor, getMessages, setUser, goToHome } = require("../utils");
const { userValidators } = require("../utils/validators");

const router = Router();

/**
 * GET /users
 */
router.get('/', (request, response) => {
	try {
		leanHelper(
			User.find({}),
			body => {
				body.forEach(item => item.isAuthor = isAuthor(request, item._id));
				response.render('users', { title: 'Users page', isUsers: true, allUsers: body });
			}
		);

	} catch (error) { console.log(error); }
});

/**
 * GET /users/:id
 */
router.get('/:id', (request, response) => {
	try {
		const { id } = request.params;

		if (isAuthor(request, ObjectId(`${id}`))) {
			const user = request.session.user;
			user.isAuthor = isAuthor(request, user._id);
			return response.render('users/show', { user });
		}

		leanHelper(
			User.findById(id),
			body => {
				body.isAuthor = isAuthor(request, body._id);
				response.render('users/show', { user: body });
			}
		);

	} catch (error) { console.log(error); }
});

/**
 * GET /users/:id/edit
 */
router.get('/:id/edit', checkAuth, (request, response) => {
	try {
		if (!request.query.allow) goToHome(response);

		const { id } = request.params;

		if (isAuthor(request, ObjectId(`${id}`))) {
			return response.render('users/edit', {
				user: request.session.user,
				// for proposalValidators redirect from update 
				userAlerts: request.flash('userAlerts'),
			});
		}

	} catch (error) { console.log(error); }
});

/**
 * POST /users/:id/update
 */
router.post('/:id/update', checkAuth, userValidators, async (request, response) => {
	try {
		const { firstName, lastName, bio, avatar, avatarUrl } = request.body;
		const { id } = request.params;

		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			request.flash('userAlerts', getMessages(errors));
			return response.status(422).redirect(`/users/${id}/edit?allow=true`);
		}

		if (isAuthor(request, ObjectId(`${id}`))) {
			const user = await User.findById(id);
			if (isAuthor(request, user._id)) {
				const userParams = { firstName, lastName, bio, avatar };
				if (request.file) userParams.avatarUrl = request.file.path;

				Object.assign(user, userParams);
				setUser(request, user);
				await user.save();
			}
		}

		response.redirect(`/users/${id}`)

	} catch (error) { console.log(error); }
});

/**
 * POST /users/:id/delete
 */
router.post('/:id/delete', checkAuth, async (request, response) => {
	try {
		const { id } = request.params;
		const user = await User.findById(id);

		if (isAuthor(request, user._id)) {
			await User.deleteOne({ _id: id });
			setUser(request, false);
		}

		goToHome(response);

	} catch (error) { console.log(error); }
});

module.exports = router;