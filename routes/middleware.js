/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
var _ = require('lodash');
var moneymex = require("../utils/moneymex.js")
var btcmarkets = require("../utils/btcmarkets.js")
var numeral = require('numeral');

/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
exports.initLocals = function (req, res, next) {
	var locals = res.locals;
	
	locals.navLinks = [
		{ label: 'Home', key: 'home', href: '/' },
		{ label: 'Guide', key: 'blog', href: '/how-it-works' },
		{ label: 'Buy', key: 'buy', href: '/order/buybtc' },
		{ label: 'Sell', key: 'sell', href: '/order/sellbtc' },
		{ label: 'Contact', key: 'contact', href: '/contact' },

	];
	locals.user = req.user;

	locals.page = {
		title: '',
		path: req.url.split("?")[0] // strip the query - handy for redirecting back to the page
	};	

	next();
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	};
	res.locals.messages = _.some(flashMessages, function (msgs) { return msgs.length; }) ? flashMessages : false;
	next();
};

const BUY_COMMISSION = 0.06; // 6%
const SELL_COMMISSION = 0.04; // 4% 
exports.rates = function(req, res, next){
	var irr = moneymex.getMarketData();
	var btc = btcmarkets.getMarketData();
	btc.buy = btc.bestAsk * (1 + BUY_COMMISSION);
	btc.sell = btc.bestBid * (1 - SELL_COMMISSION);
	res.locals.rates = {
		buyAUD: numeral(btc.buy).format('$0,0.00'),
		sellAUD: numeral(btc.sell).format('$0,0.00'),
		buyIRR: numeral(btc.buy * irr.buy).format('0,0'),
		sellIRR: numeral(btc.sell * irr.sell).format('0,0')
	};
	next();
}

exports.locale = function(req, res, next) {
	// override preferred locale
	req.i18n.setLocale(req.i18n.defaultLocale);
	
	if (req.query.lang) {
		req.i18n.setLocaleFromQuery();
		res.cookie("lang", req.i18n.getLocale());
	} else {
		req.i18n.setLocaleFromCookie();
	}
	res.locals.locale = req.i18n.getLocale();
	res.locals.FARSI = req.i18n.translate('fa', 'Farsi');
	next();
}

exports.resendConfirmationEmail = function(req, res, next) {
	req.user.confirmEmail(function(err){
		if (err) {
			req.flash('error', 'There is an issue!');
		} else {
			req.flash('success', 'The email was sent!');
		}
   		res.redirect('/signin');
	});
}

/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/signin');
	} else {
		next();
	}
};

exports.requireAdmin = function (req, res, next) {
	if (req.user && req.user.canAccessKeystone) {
		next();
	} else {
		req.flash('error', 'Invalid page.');
		res.redirect('/signin');
	}
};
