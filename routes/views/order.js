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
	locals.orderType = (req.params.orderType || '').toUpperCase();
	if (locals.orderType != 'BTCBUY' && locals.orderType != 'BTCSELL'){
		locals.orderType != 'BTCBUY';
	}

	view.query('incompleteOrdersCount', 
		Order.model.count()
			.where('customer', req.user)
			.where('status').ne('COMPLETE')
	);

	// On POST requests, add the Order item to the database
	view.on('post', { action: 'order' }, function (next) {

		Order.model.count()
			.where('customer', req.user)
			.where('status').ne('COMPLETE')
			.exec(function(err, count){
				if (err) return next(err);	
				if (count > 5){
					req.flash("error", "No new orders can be submitted");
					return next();
				}
				else {
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
							newOrder.notifyAdmin(function(err){
								if (err) console.log("Email notification to admin failed", err);
							});
						}
						next();
					});
				}
			});
		
	});

	view.render('order');
};
