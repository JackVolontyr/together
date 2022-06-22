const utils = {
	qs: selector => document.querySelector(selector),
	qsAll: selector => document.querySelectorAll(selector),
};

window.onload = function (event) {
	M.Tabs.init(utils.qs('[data-auth-tabs]'));
}
