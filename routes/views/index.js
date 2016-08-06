var keystone = require('keystone');
const moneymex = require("../../utils/moneymex.js");
const btcmarkets = require("../../utils/btcmarkets.js");


exports = module.exports = function (req, res) {


	var view = new keystone.View(req, res);
	var locals = res.locals;

	console.log(req.i18n.__("Hello"));
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';

	// Render the view
	view.render('index');
};
