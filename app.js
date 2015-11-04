var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var morgan = require('morgan');
var db = new require('mongode2')({
  dbName: 'twitter',
  colName: 'collesiumPub'
});
// replace with your API Key JSON file
var config = require('./server/config/twitterConfig');
var twtStream = require('node-tweet-stream')(config);
var twtApi = require('ntwitter')(config);

twtStream.on('reconnect', function(msg) {
  console.log(msg.type + ", " + msg.code);
});

var app = express();

app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

var server = require('http').Server(app).listen(2000);
var io = require('socket.io')(server).listen(2001);

// Socket Setup

io.on('connection', function(socket) {
  twtStream.on('tweet', function(tweet) {
    tweet.created_at = Date.now();
    socket.emit('tweet', tweet);
  });
  setTimeout(function() {
    socket.emit('tweet', {
      msg: "test",
      text: "This is an example Tweet. Track phrases or users to stream more.",
      user: {
        screen_name: "The_KrisWithA_K",
        profile_image_url: "https://pbs.twimg.com/profile_images/633416943769415680/tV4cpsEo.png"
      },
      created_at: Date.now(),
      entities: {
        media: []
      }
    });
  }, 1000);
});

// End-point Setup

app.get('/sets', function(req, res) {
  if (twtStream.following().length) {
    twtApi.showUser(twtStream.following(), function(err, data) {
      var users = [];
      data.forEach(function(item) {
        users.push(item.screen_name);
      });
      res.json({
        following: users,
        tracking: twtStream.tracking(),
        blacklisting: []
      });
    })
  } else {
    res.json({
      following: [],
      tracking: twtStream.tracking()
    });
  }
});

app.post('/newThing', function(req, res) {
  console.log(req.body.participle, req.body.noun);
  if (req.body.participle == "following") {
    twtApi.showUser(req.body.noun, function(err, data) {
      twtStream.follow(data[0].id);
    });
  } else {
    twtStream.track(req.body.noun);
  }
  res.send("Good news!");
  io.emit('new-criteria', {verb: req.body.participle, noun: req.body.noun});
});

app.post('/removeThing', function(req, res) {
  var unverb = "un" + req.body.verb.slice(0, -3);
  console.log(unverb, req.body.noun);
  twtStream[unverb](req.body.noun);
  res.send('Good News!');
  io.emit('remove-criteria', {verb: req.body.verb, noun: req.body.noun})
});
