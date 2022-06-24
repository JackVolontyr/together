const registrationOption = ({ email, firstName, lastName, baseUrl }) => ({
	subject: 'Together. Registration is success!',
	html: `
		<h1>Welcome! We are Together.</h1>
		<p>Dear, ${firstName} ${lastName}, your account (${email}) has been created!</p>
		<hr/>
		<a href="${baseUrl}/">Go to Together.</a>
	`
});

const registrationOptionToModerator = ({ email, firstName, lastName, baseUrl }) => ({
	subject: 'Together. To M: Registration is success!',
	html: `
		<h1>Hello, Moderator! We are Together.</h1>
		<p>This account has been created:</p>
		<p>First Name: ${firstName},</p>
		<p>Last Name: ${lastName},</p>
		<p>Email: (${email}).</p>
		<hr/>
		<a href="${baseUrl}/">Go to Together.</a>
	`
});

const resetPasswordOption = ({ route, resetPasswordToken, email, firstName, lastName, baseUrl }) => ({
	subject: 'Together. Forgot your password?',
	html: `
		<h1>Hi, ${firstName} ${lastName}!</h1>
		<h2>Someone wants to change your password for your (${email}) account.</h2>
		<p>If you want to change the password, click on the link below. if not, do nothing.</p>
		<p>If not, do nothing.</p>
		<a href="${baseUrl}/${route}/${resetPasswordToken}">Reset your password.</a>
		<p>The link is active for an hour.</p>
		<hr/>
		<a href="${baseUrl}/">Go to Together.</a>
	`
});

module.exports = {
	registrationOption, 
	registrationOptionToModerator,
	resetPasswordOption
}