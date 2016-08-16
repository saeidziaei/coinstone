var keystone = require('keystone');
var Order = keystone.list('Order');
var User = keystone.list('User');

exports = module.exports = function (req, res) {
	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'dashboard';
	locals.page.title = "Admin Dashboard"
	
	view.query('outstandingOrders', 
		Order.model.find()
			.where('status').ne('COMPLETE')
			.populate('rep customer')
			.sort('-createdAt')
	);

	view.query('reps', 
		User.model.find()
			.where('isRep', true)
	);

	view.on('post', { action: 'assign-rep' }, function (next) {
	    Order.model.findOneAndUpdate(
    		{_id: req.body.order_id}, 
    		{$set:{rep: req.body.rep_id}}, function(err, order){
    			if (err) return next(err);
    			if (!order) {
    				req.flash('error', "Update failed.");
    			}
    			req.flash('success', 'Update success.');
    			next();
    		});
    

	});

	// Render the view
	view.render('admin/dashboard');
};