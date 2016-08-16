var keystone = require('keystone');
var Order = keystone.list('Order');

exports = module.exports = function (req, res) {
	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'me';
	locals.page.title = "My Profile";
	locals.momentj = require('moment-jalaali');
	
	
	view.query('myOrders', 
		Order.model.find()
			.where('customer', req.user)
			.populate('rep')
			.sort('-createdAt')
	);

	
	// Render the view
	view.render('me');
};