const fetch = require('node-fetch');
var cheerio = require('cheerio');
var numeral = require("numeral");

var marketData = {buy: 0, sell: 0}
exports.getMarketData = () => marketData;

const REFRESH_INTERVAL = 1000 * 60 * 200; // every 200 minutes
refreshMarketData();
setInterval(refreshMarketData, REFRESH_INTERVAL);

function refreshMarketData(){
    try {
    fetch('http://www.o-xe.com/')
        .then(function(res) {
            return res.text();
        }).then(function(body) {
            var $ = cheerio.load(body);
            marketData.sell = numeral().unformat($("td[id='CURAUD']").parent().find(".MonetarySell").text());
            marketData.buy = numeral().unformat($("td[id='CURAUD']").parent().find(".MonetaryBuy").text());
            console.log("OXO rates refreshed.")
        });
    } catch (e) {
        ; // do nothing
    }
}
