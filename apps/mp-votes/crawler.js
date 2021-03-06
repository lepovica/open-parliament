var $ = require('cheerio');
var urlInfo = require('url');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * Creates a crawler.
 * @param url
 * @param target Either a javascript Date object or a generic object that includes
 * specific years, months or dates to be crawled. I.e.:
 *   If passed as `new Date()` will be interpret as a start date for the crawl. Anthing older
 *   than the start date will not be crawled
 *   If passed as:
 *   [2013,2014] ..or
 *   ---
 *   {
 *      2013: [8,9]
 *   }... or
 *   ---
 *   {
 *     2013: {
 *       8: [14,24]
 *     }
 *   }
 *   --
 *   will be interpret as specific year, or month or date to do the crawl.
 *
 * @constructor
 */
var Crawler = function(url, target, logger, downloader) {
	this.baseUrl = urlInfo.parse(url);
	this.baseUrl = this.baseUrl.protocol+'//'+this.baseUrl.host
	this.url = url;
	this.logger = logger;
	this.downloader = downloader;

	if (target instanceof Date) {
		this.startDate = target;
	} else {
		this.forced = target;
	}
}

util.inherits(Crawler, EventEmitter);

Crawler.prototype.baseUrl = null;
Crawler.prototype.url = null;
Crawler.prototype.startDate = null;
Crawler.prototype.forced = null;
Crawler.prototype.logger = null;
Crawler.prototype.downloader = null;

/**
 * Crawls the page that includes calendar gateway point to all
 * transcripts of a parliament active for one certain mandate
 */
Crawler.prototype.run = function() {
    var self = this;
    self.downloader.get(this.url, function(html) {
        var $calender= $('#calendar', html);
        var $monthsLinks = $calender.find('a').filter(function() {
            var hrefTokens = $(this).attr('href').split('/');
            var date = hrefTokens[hrefTokens.length-1].split('-');
            var month = parseInt(date[1])-1;
            var year = parseInt(date[0]);
            return self._shouldCrawl(year, month);
        })
        $monthsLinks.each(function() {
            self.processMonth(self.baseUrl+$(this).attr('href'));
        })
    })
}

/**
 * Crawls the page that includes a month worth of transcripts of a
 * parliament active for one certain mandate
 *
 * @param url
 */
Crawler.prototype.processMonth = function(url) {
    var self = this;

    self.downloader.get(url, function(html) {
        var $list= $('#monthview', html);
        var $transcriptsLinks = $list.find('a').filter(function() {
            var date = $(this).parent().text().split(', ')[1].split('/');
            return self._shouldCrawl(parseInt(date[2]), parseInt(date[1])-1, parseInt(date[0]))
        })
        $transcriptsLinks.each(function() {
            self.emit('plenary', self.baseUrl+$(this).attr('href'))
        })
    })
}

/**
 * Checks whether to crawl transcripts on certain year, or certain year and month or certain date
 *
 * @param year
 * @param month
 * @param day
 * @returns {boolean}
 * @private
 */
Crawler.prototype._shouldCrawl = function(year, month, day) {
    if (this.startDate != null) {
        var d = this.startDate;
        return year >= d.getYear() && month >= d.getMonth && (typeof day == 'undefined' || day > d.getDate());
    }
    if (this.forced == null) return true;

    // User has passed array of years
    if (this.forced instanceof Array && this.forced.indexOf(year)==-1) return false;
    // User has passed array of months or hash map of months, each with array of days
    if (typeof this.forced[year] == 'undefined') return false;
    // User hasn't passed a month, return true
    if (typeof month == 'undefined') return true;

    // User has passed array of months
    if (this.forced[year] instanceof Array && this.forced[year].indexOf(month)==-1) return false;
    // User has passed hash map of months, each with array of days
    if (typeof this.forced[year][month] == 'undefined') return false;
    // User hasn't passed a day, return true
    if (typeof day == 'undefined') return true;

    // Checks for specific date
    return this.forced[year][month].indexOf(day) > -1;
}

exports = module.exports = Crawler;