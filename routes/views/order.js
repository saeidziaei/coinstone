var keystone = require('keystone');
var Order = keystone.list('Order');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'order';
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.enquirySubmitted = false;

	// On POST requests, add the Order item to the database
	view.on('post', { action: 'order' }, function (next) {

		var newOrder = new Order.model();
		newOrder.customer = req.user;
		
		var updater = newOrder.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'orderType, cardNumber, btcAmount, btcAddress, message',
			errorMessage: 'There was a problem submitting your order:',
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.enquirySubmitted = true;
				locals.OrderNumber = newOrder.orderNumber;
			}
			next();
		});
	});

	view.render('order');
};
