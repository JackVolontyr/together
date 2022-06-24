const { Router } = require("express");

const router = Router();

/**
 * GET /contacts
 */
router.get('/', (_, response) => {
	response.render('contacts', {
		title: 'Contacts page',
		moderatorEmail: process.env.MODERATOR_EMAIL,
		isContacts: true
	});
});

module.exports = router;