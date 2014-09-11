var express = require('express');
var router = express.Router();

var User = require('../modules/user');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('register');
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.get('/home', function(req, res) {
  console.log(req.session.username);
  res.render('home');
})

router.get('/chat', function(req, res) {
  res.render('chat');
})

router.get('/history', function(req, res) {
  res.render('history');
})

// router.get('/test', function(req, res) {
//   console.log('filter')
//   res.send('hehe')
// })

/* POST handles */
router.post('/register', function(req,res) {
  var name = req.body.username;
  var pwd = req.body.userPwd;

  var user = new User({
    username : name,
    userPwd  : pwd,
  });
  var result = null;
  user.register(function(err, newuser){
    if(!err){
      req.session.username = name;
      result = true;
      res.send(result);
    }else{
      result = false;
      res.send(result);
    }
  });
});

router.post('/login', function(req, res){
  var name = req.body.username;
  var pwd = req.body.userPwd;

  User.loginCheck(name, pwd, function(err, result){
      if(!err){
        if(result){
          req.session.username = name;
          res.send(result);
        }else{
          res.send("login failed");
        }        
      }
  });
});

module.exports = router;
