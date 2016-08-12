var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true },
	phone: {type: String},
	password: { type: Types.Password, initial: true, required: true },
	emailConfirmationKey: { type: String, hidden: true },
	emailConfirmed: { type: Boolean, default: false }
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
	isRep: { type: Boolean, label: 'Is Coinava Rep', index: true },
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});


/**
 * Relationships
 */
User.relationship({ ref: 'Order', path: 'orders', refPath: 'customer' });
User.relationship({ ref: 'Order', path: 'assignedOrders', refPath: 'rep' });

/**
 * Methods
 * =======
*/

User.schema.methods.resetPassword = function(callback) {
	var user = this;
	user.resetPasswordKey = keystone.utils.randomString([16,24]);
	user.save(function(err) {
		if (err) return callback(err);
		new keystone.Email('forgotten-password').send({
			user: user,
			link: '/reset-password/' + user.resetPasswordKey,
			subject: 'Reset your Coinava Password',
			to: user.email,
			from: {
				name: 'Coinava',
				email: 'no-reply@coinava.com'
			}
		}, callback);
	});
}

User.schema.pre('save', function(next){
    var user = this;
	if (!user.emailConfirmationKey){
		user.emailConfirmationKey = keystone.utils.randomString([16,24]);
	}
	if (!user.emailConfirmed){
		new keystone.Email('confirm-registration').send({
			user: user,
			link: '/confirm-registration/' + user.emailConfirmationKey,
			subject: 'Confirm your Coinava registration',
			to: user.email,
			from: {
				name: 'Coinava',
				email: 'no-reply@coinava.com'
			}
		}, next);
		
	} else {
		next();
	}
});



/**
 * Registration
 */
User.defaultColumns = 'name, email, phone, isAdmin, isRep';
User.register();
