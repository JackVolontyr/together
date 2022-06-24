const { model, Schema } = require("mongoose");

const userSchema = new Schema({
	email: { type: String, required: true },
	password: { type: String, required: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	proposals: [{ type: Schema.Types.ObjectId, ref: 'Proposal' }],
	bio: { type: String },
	avatarUrl: { type: String },
	resetPasswordToken: String,
	resetPasswordTokenExpiration: Date,
});

userSchema.methods.addProposal = function (proposal) {
	this.proposals = [...this.proposals, proposal];
	return this.save();
}

module.exports = model('User', userSchema);