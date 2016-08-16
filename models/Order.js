var async = require('async');
var keystone = require('keystone');
var Types = keystone.Field.Types;
var KeyService = keystone.list("KeyService");


var Order = new keystone.List('Order', {
	track: true
});

Order.add({
	orderNumber: {type: Types.Number, required: false, index: true},
	customer: { type: Types.Relationship, required: true, ref: 'User', index: true, initial: false },
	rep: { type: Types.Relationship, required: false, ref: 'User', filters:{isRep: true}, index: true, initial: false },
    status : {type: String, required: true, default: 'PENDING', index:true },
    orderType: { type: String, required: true, default: 'BTCBUY'},
    cardNumber: { type: String, required: false},
	btcAmount: {type: Types.Number, required: true, initial: false},
    btcAddress: { type: String, required: false},
    message: {type: String, initial: true },
});


Order.schema.pre('save', function(next){
    var doc = this;
	if (!doc.orderNumber){
		var keyService = keystone.list('KeyService').model;
		keyService.findOne({keyName: 'nextOrderNumber'}, function(err, result){
			// OrderNumber is in this format YYxxxx in which YY is the last 2 digits of year
			if (err) return next(err);
			var nextOrderNumber;
			var year = new Date().getFullYear().toString().substr(2, 2);

			if (result && result.seq.toString().substr(0, 2) == year){
				// still in current year
				nextOrderNumber = result.seq + 1;
			} else {
				// initial step as well as when the year changes
				nextOrderNumber = Number(year) * 1000 + 1;
				// initial step only
				if (!result) {
					result = new KeyService.model({
							keyName: 'nextOrderNumber',
							seq: nextOrderNumber});
				}
			}
			result.seq = nextOrderNumber;
			result.save(function(err){
				if (err) return next(err);
				doc.orderNumber = nextOrderNumber;
				next();
			});
		});
		
	} else {
		next();
	}		


});

Order.schema.methods.notifyAdmin = function(callback) {
	var order = this;
	// Method to send the notification email after data has been loaded
	var sendEmail = function(err, results) {
		if (err) return callback(err);
		var admin = results.admin;
		new keystone.Email('admin-notification-new-order').send({
				admin: admin.name.first || admin.name.full,
				customer: results.customer ? results.customer.name.full : 'Somebody',
				orderURL: '/admin/order/' + order._id,
				subject: 'New Order to Coinava',
				to: 'saeid.ziaei@cba.com.au', // admin.email,
				from: {
					name: 'Coinava Website',
					email: 'dev@coinava.com'
				}
			}, callback);
	}
	// Query data in parallel
	async.parallel({
		customer: function(next) {
			keystone.list('User').model.findById(order.customer).exec(next);
		},
		admin: function(next) {
			keystone.list('User').model.findOne().where('isAdmin', true).exec(next)
		}
	}, sendEmail);
};



Order.register();