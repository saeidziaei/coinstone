/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);
var i18n = require('i18n-2');

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);
keystone.pre('render', middleware.rates);
keystone.pre('render', middleware.locale);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
};

// Setup Route Bindings
exports = module.exports = function (app) {
	i18n.expressBind(app, {
	    // setup some locales - other locales default to en silently
	    locales: ['fa', 'en'], 
    	defaultLocale: 'fa',
	});
	
	// Views
	app.get('/', routes.views.index);
	app.get('/blog/:category?', routes.views.blog);
	app.get('/blog/post/:post', routes.views.post);
	app.all('/contact', routes.views.contact);
	app.get('/how-it-works', routes.views['how-it-works']);
	app.all('/me*', middleware.requireUser);
	app.get('/me', routes.views.me);
	
	app.all('/order/:orderType', middleware.requireUser, routes.views.order);

	// Session
	app.all('/signin', routes.views.session.signin);
	app.get('/signout', routes.views.session.signout);
	app.all('/join', routes.views.session.join);
	app.get('/confirm-registration/:key', routes.views.session['confirm-registration']);
	app.all('/forgot-password', routes.views.session['forgot-password']);
	app.all('/reset-password/:key', routes.views.session['reset-password']);
	app.post('/resend-confirmation-email', middleware.requireUser, middleware.resendConfirmationEmail)
	app.all('/admin*', middleware.requireAdmin);
	app.all('/admin/dashboard', routes.views.admin.dashboard);
	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

};
