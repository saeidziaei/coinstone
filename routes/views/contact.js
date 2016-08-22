var keystone = require('keystone');
var Enquiry = keystone.list('Enquiry');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'contact';
	locals.page.title = 'Contact Us';
	var user = req.user;
	var preFilled = user ? {
		name : user.name.full,
		phone: user.phone,
		email: user.email

	} : {};
	
	locals.formData = req.body || {};
	locals.formData.name = locals.formData.name || preFilled.name;
	locals.formData.phone = locals.formData.phone || preFilled.phone;
	locals.formData.email = locals.formData.email || preFilled.email;
	
	locals.validationErrors = {};
	locals.enquirySubmitted = false;

	// On POST requests, add the Enquiry item to the database
	view.on('post', { action: 'contact' }, function (next) {

		var newEnquiry = new Enquiry.model();
		var updater = newEnquiry.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'name, email, phone, message',
			errorMessage: 'There was a problem submitting your enquiry:',
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.enquirySubmitted = true;
			}
			next();
		});
	});

	view.render('contact');
};
