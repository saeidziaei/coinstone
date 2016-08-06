const fetch = require('node-fetch');
var cheerio = require('cheerio');


var marketData = {buy: 0, sell: 0}
exports.getMarketData = () => marketData;

const REFRESH_INTERVAL = 1000 * 60 * 20; // every 20 minutes
refreshMarketData();
setInterval(refreshMarketData, REFRESH_INTERVAL);

function refreshMarketData(){
    fetch('https://www.mex.market/')
        .then(function(res) {
            return res.text();
        }).then(function(body) {
            var $ = cheerio.load(body);
            marketData.sell = extractNumber($(".msell tbody tr:nth-child(1) td:nth-child(2)").text());
            marketData.buy = extractNumber($(".mbuy tbody tr:nth-child(1) td:nth-child(2)").text());
            console.log("Moneymex rates refreshed.")
        });
}

function extractNumber(txt) {
    try {
        return Number(txt.trim().replace(",", "")) || 0;
    } catch (e) {return 0;}
}