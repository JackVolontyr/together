const { Schema, model } = require("mongoose");

//const { v4: uuidv4 } = require('uuid');
//const fs = require("fs");
//const path = require("path");

const proposalSchema = new Schema({
	title: { type: String, required: true },
	//firstName: { type: String, required: true },
	//lastName: { type: String, required: true },
	comment: { type: String, required: true },
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
}); 

//proposalSchema.method('toClient', function() {
//	const proposal = this.toObject();
//	proposal.id = proposal._id;
//	delete proposal._id;
//	return proposal;
//});

module.exports = model('Proposal', proposalSchema);