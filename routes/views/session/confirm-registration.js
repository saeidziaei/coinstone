var keystone = require('keystone'),
	User = keystone.list('User');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	view.on('init', function(next) {

	User.model.findOneAndUpdate(
		{emailConfirmationKey: req.params.key}, 
		{$set:{emailConfirmed: true}}, function(err, user){
			if (err) return next(err);
			if (!user) {
				req.flash('error', "Sorry, the registration link isn't valid.");
				return res.redirect('/');
			}
			req.flash('success', 'Your registration is complete.');
			res.redirect('/signin');
		});
/*		User.model.findOne().where('emailConfirmationKey', req.params.key).exec(function(err, user) {
			if (err) return next(err);
			if (!user) {
				req.flash('error', "Sorry, the registration link isn't valid.");
				return res.redirect('/');
			}
			user.emailConfirmed = true;
			user.save(function(err){
    			if (err) return next(err);
    			req.flash('success', 'Your registration is complete, please sign in.');
    			res.redirect('/signin');
			})
		});
*/		
	});
	
	view.render('session/signin');

}
