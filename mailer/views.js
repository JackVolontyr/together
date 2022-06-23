const registrationOption = ({ email, firstName, lastName, baseUrl }) => ({
	subject: 'Registration is success!',
	html: `
		<h1>Welcome! We are Together.</h1>
		<p>Dear, ${firstName} ${lastName}, your account (${email}) has been created!</p>
		<hr/>
		<a href="${baseUrl}">Go to Together.</a>
	`
});

module.exports = {
	registrationOption
}