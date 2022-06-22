const { Router } = require("express");
const { validationResult } = require("express-validator");

const Proposal = require("../models/Proposal");
const User = require("../models/User");

const { leanHelper, goToHome, isAuthor, getMessages } = require("../utils");
const { checkAuth } = require("../middleware");
const { proposalValidators } = require("../utils/validators");

const router = Router();

/**
 * GET /proposals
 */
router.get('/', (request, response) => response.render('proposals', {
	title: 'Add proposal page', 
	isProposals: true, 
}));

/**
 * POST /proposals
 */
router.post('/', checkAuth, proposalValidators, async (request, response) => {
	try {
		const { title, comment } = request.body;

		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			request.flash('proposalAlerts', getMessages(errors));
			return response.status(422).render('proposals', {
				proposalAlerts: request.flash('proposalAlerts'),
				data: {
					title: request.body.title,
					comment: request.body.comment,
				},
			});
		}

		const candidate = await User.findById(request.user);

		if (candidate) {
			const proposal = new Proposal({ title, userId: request.user, comment });
			await proposal.save();
			await candidate.addProposal(proposal);
		}

		goToHome(response);

	} catch (error) { console.log(error); }
});

/**
 * GET /proposals/:id
 */
router.get('/:id', (request, response) => {
	try {
		leanHelper(
			Proposal.findById(request.params.id),
			body => response.render('proposals/show', { proposal: body })
		);

	} catch (error) { console.log(error); }
});

/**
 * GET /proposals/:id/edit
 */
router.get('/:id/edit', checkAuth, (request, response) => {
	try {
		if (!request.query.allow) goToHome(response);
		
		leanHelper(
			Proposal.findById(request.params.id), 
			body => {
				if (isAuthor(request, body.userId._id)) {
					response.render('proposals/edit', { 
						proposal: body, 
						// for proposalValidators redirect from update
						proposalAlerts: request.flash('proposalAlerts'), 
					});

				} else { goToHome(response); }
			}
		);

	} catch (error) { console.log(error); }
});

/**
 * POST /proposals/:id/update
 */
router.post('/:id/update', checkAuth, proposalValidators, async (request, response) => {
	try {
		const { title, comment } = request.body;

		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			request.flash('proposalAlerts', getMessages(errors));
			return response.status(422).redirect(`/proposals/${request.params.id}/edit?allow=true`);
		}
		
		const proposal = await Proposal.findById(request.params.id);
		if (isAuthor(request, proposal.userId._id)) {
			Object.assign(proposal, { title, comment });
			await proposal.save();
			//await Proposal.findByIdAndUpdate(request.params.id, { title, comment });
		}
		
		goToHome(response);

	} catch (error) { console.log(error); }
});

/**
 * POST /proposals/:id/delete
 */
router.post('/:id/delete', checkAuth, async (request, response) => {
	try {
		const proposal = await Proposal.findById(request.params.id);
		if (isAuthor(request, proposal.userId._id)) {
			await Proposal.deleteOne({
				_id: request.params.id,
				userId: request.user._id
			});
		}

		goToHome(response);

	} catch (error) { console.log(error); }
});

module.exports = router;