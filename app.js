/*
    Coded by Dejan Bozinoski - bozinoski[at]outlook.com
    https://deko96.github.io || https://facebook.com/deko96
    Octomber 2016
    All rights reserved
*/
var _PORT_ = 80;
var _TITLE_ = 'YouTube Scrapper';
var page = {
    title: _TITLE_
};
var express = require('express');
var bodyParser = require('body-parser');
var urlEncode = require('urlencode');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

// Setting the default rendering method to EJS
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

// Global variables
var scrappingLimit = 100;
var hasFilters = true;
var scrapeURL = 'https://www.youtube.com/results?search_query=';
var URLs = [];

// Index Page
app.get('/', function(req, res) {
    page.path = 'Index';
	res.render('pages/index', {
        page: page
    });
});

// Contact Page 
app.get('/about', function(req, res) {
	res.render('pages/about');
});

// Contact Page
app.get('/contact', function(req, res) {
   res.render('pages/contact');
});

// Index Form Handler
app.post('/scrapeit', function(req, res) {
    var form = {
        keyword: req.body.keyword,
        uploadDate: req.body.filter_uploadDate,
        type: req.body.filter_type,
        duration: req.body.filter_duration,
        features: req.body.filter_features,
        sortBy: req.body.filter_sortBy
    };
    if(form.keyword.length == 0) {
        res.json({
            error: "You can't scrape without entering keyword."
        });
    } else {
        if(form.uploadDate == -1 && form.type == -1 && form.duration == -1 && form.features == -1 && form.sortBy == -1)
            hasFilters = false;
        scrapeURL += urlEncode(form.keyword);
        
        if(hasFilters) {
            getURL(form);
        } else {
            scrapeIT();
        }
    }
    res.end();
});

// Custom Functions
var scrapeIT = function() {
    request(scrapeURL, function(error, response, body) {
        if(!error && response.statusCode == 200) {
            var $ = cheerio.load(body, { decodeEntities: false });
            $('#results ol li:last-child ol > li').each(function(i, e) {
                URLs.push($(e).find('a:first-child').attr('href'));
                if(URLs.length <= scrappingLimit) {
                    console.log($('.search-pager > button').next());
                    //scrapeIT();
                }
            });
        }
    });
}

var getURL = function(form) {
    if(form.uploadDate == -1 && form.type == -1 && form.duration == -1 && form.features == -1 && form.sortBy == -1) {
        hasFilters = false;
        scrapeIT();
    } else {
        request(scrapeURL, function(error, response, body) {
           if(!error && response.statusCode == 200) {
               var $ = cheerio.load(body, { decodeEntities: false });
               $('.filter-col > ul').each(function(i, e) {
                   if(i == 0)
                       $(e).attr('id', 'upDate');
                   else if(i == 1)
                       $(e).attr('id', 'type');
                   else if(i == 2)
                       $(e).attr('id', 'duration');
                   else if(i == 3)
                       $(e).attr('id', 'features');
                   else
                       $(e).attr('id', 'sort');
               });
               $('.filter-col > ul > li').each(function(i, e) {
                  $(e).attr('id', i); 
               });
               if(form.uploadDate != -1) {
                   var filterURL = $('#upDate > li').eq(form.uploadDate).find('a').attr('href');
                   if(filterURL != undefined && filterURL != null && filterURL != "") {
                       scrapeURL = 'https://youtube.com' + filterURL;
                       form.uploadDate = -1;
                       getURL(form);
                   }
               }
               if(form.type != -1) {
                   var filterURL = $('#type > li').eq(form.type).find('a').attr('href');
                   if(filterURL != undefined && filterURL != null && filterURL != "") {
                       scrapeURL = 'https://youtube.com' + filterURL;
                       form.type = -1;
                       getURL(form);
                   }
               }
               if(form.duration != -1) {
                   var filterURL = $('#duration > li').eq(form.duration).find('a').attr('href');
                   if(filterURL != undefined && filterURL != null && filterURL != "") {
                       scrapeURL = 'https://youtube.com' + filterURL;
                       form.duration = -1;
                       getURL(form);
                   }
               }
               if(form.features != -1) {
                   var filterURL = $('#features > li').eq(form.features).find('a').attr('href');
                   if(filterURL != undefined && filterURL != null && filterURL != "") {
                       scrapeURL = 'https://youtube.com' + filterURL;
                       form.features = -1;
                       getURL(form);
                   }
               }
               if(form.sort != -1) {
                   var filterURL = $('#features > li').eq(form.sort).find('a').attr('href');
                   if(filterURL != undefined && filterURL != null && filterURL != "") {
                       scrapeURL = 'https://youtube.com' + filterURL;
                       form.sort = -1;
                       getURL(form);
                   }
               }
           }
        });
    }
    
}
app.listen(_PORT_);
console.log('Application started on port ' + _PORT_);