var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').urlencoded({ extended: true }));

var redis;
if(process.env.REDISTOGO_URL) {
	var url = require('url').parse(process.env.REDISTOGO_URL);
	redis = require('redis').createClient(url.port, url.hostname);
	redis.auth(url.auth.split(':')[1]);
} else {
	redis = require('redis').createClient();
}

var chance = require('chance')();

app.get('/', function(req, res) {
	res.render('index', { shrd: '' });
});

app.get('/:shrd', function(req, res) {
	redis.get(req.params.shrd, function(err, val) {
		if(val != null) {
			res.redirect(val);
		} else {
			res.redirect('/');
		}
	});
});

app.post('/', function(req, res) {
	var shrd = makeShrd();
	redis.set(shrd, req.body.url, function(err, val) {
		if(err) {
			res.render('index', { shrd: 'Something went wrong.' });
		} else {
			res.render('index', { shrd: 'https://shrdnr.herokuapp.com/' + shrd });
		}
	});
});

var makeShrd = function() {
	var shrd = chance.hash({ length: 8 });
	while(shrdExists(shrd)) {
		shrd = chance.hash({ length: 8 });
	}
	return shrd;
}

var shrdExists = function(shrd) {
	redis.exists(shrd, function(err, res) {
		if(res === 0) {
			return false;
		} else {
			return true;
		}
	});
}

app.listen(process.env.PORT || 8000);