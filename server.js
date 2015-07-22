var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var redis;
if(process.env.REDISTOGO_URL) {
	var url = require('url').parse(process.env.REDISTOGO_URL);
	redis = require('redis').createClient(url.port, url.hostname);
	redis.auth(url.auth.split(':')[1]);
} else {
	redis = require('redis').createClient();
}

app.get('/', function(req, res) {
	res.render('index');
});

app.post('/make', function(req, res)) {

}

app.listen(process.env.PORT || 8000);