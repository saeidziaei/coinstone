const fetch = require('node-fetch');
var cheerio = require('cheerio');


var marketData = {
    "bestBid":0,
    "bestAsk":0,
    "lastPrice":0,
    "currency":"AUD",
    "instrument":"BTC",
    "timestamp":1470270921,
    "volume24h":494.34984}
exports.getMarketData = () => marketData;

const REFRESH_INTERVAL = 1000 * 60 * 15; // every 15 minutes
refreshMarketData();
setInterval(refreshMarketData, REFRESH_INTERVAL);

function refreshMarketData(){
    try {
    fetch('https://api.btcmarkets.net/market/BTC/AUD/tick')
        .then(function(res) {
            return res.json();
        }).then(function(json) {
            marketData = json;
            console.log("btcmarkets rates refreshed.")
        });
    } catch (e) {
        ; // do nothing
    }
}

