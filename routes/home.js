const { Router } = require("express");
const Proposal = require("../models/Proposal");
const { leanHelper, isAuthor } = require("../utils");

const router = Router();

/**
 * GET /
 */
router.get('/', (request, response) => {
	try {
		leanHelper(
			Proposal.find({}).populate('userId', 'firstName lastName').select('title comment'),
			body => {
				body.forEach(item => item.isAuthor = isAuthor(request, item.userId._id));
				response.render('index', { title: 'Home page', isHome: true, allProposals: body })
			}
		);

	} catch (error) { console.log(error); }
});

module.exports = router;