var keystone = require('keystone');
var Types = keystone.Field.Types;
var KeyService = keystone.list("KeyService");


var Order = new keystone.List('Order', {
	track: true
});

Order.add({
	orderNumber: {type: Types.Number, required: false, index: true},
	customer: { type: Types.Relationship, required: false, ref: 'User', index: true, initial: false },
	rep: { type: Types.Relationship, required: false, ref: 'User', filters:{isRep: true}, index: true, initial: false },
    status : {type: String, required: true, default: 'PENDING', index:true },
    orderType: { type: String, required: true, default: 'BUY'},
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



Order.register();