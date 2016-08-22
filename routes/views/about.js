var keystone = require('keystone');


exports = module.exports = function (req, res) {
	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'about';


    var time = require('time');
    
    var a = new time.Date();
    
    a.setTimezone('Asia/Tehran');
    locals.tehranTime = a.toTimeString().substring(0, 5);
    a.setTimezone('Australia/Sydney');
    locals.sydneyTime = a.toTimeString().substring(0, 5);
    
	// Render the view
	view.render('about');
};
