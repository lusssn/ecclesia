var express = require('express'); 
var router = express.Router();

var Meeting = require('../modules/meeting');  
var spliter = require('../modules/split');
var ObjectID = require('mongodb').ObjectID;
var compresser = require('../modules/compresser.js');


router.get('/', function (req, res) {
  if (!req.session.username) {
    return res.redirect('/');
  }

  return res.render('chat', {
    session: req.session,
    username: req.session.username,
    isHost: req.session.username === req.session.host
  });
});

router.post('/upload-markdown', function (req, res) {
  var t = req.body.text;
  var markdowns = t.split(/\+{6,}/);
  var author = req.session.username;
  var roomName = req.session.roomName;
  var host = req.session.host;
  
  console.log(markdowns);
  console.log(author, roomName, host);
  Meeting.saveMdTemp(roomName, host, author, markdowns, function (err, newMds){
    if(!err){
      return res.json({response : "upload-markdown-success", mdArr : newMds});
    } else {
      return res.json({response: 'upload-markdown-failed'});
    }
  });
});

router.post('/query-preview-markdown', function (req, res){
  var roomName = req.session.roomName;
  var host = req.session.host;
  if (!roomName || !host) {
    return res.json({response:"query-markdown-success", previewDict: null});
  }
  Meeting.queryMdPreview(roomName, host, function (err, previewDict){
    if (!err) {
      if (previewDict.length) {
        return res.json({response:"query-markdown-success", previewDict : previewDict});
      } else {
        return res.json({response:"query-markdown-success", previewDict : null});
      }
    } else {
      console.log(err);
      return res.json({response:'query-markdown-failed', previewDict: null});
    }

  });

})
router.post('/query-meeting-markdown', function (req, res){
  var roomName = req.session.roomName;
  var host = req.session.host;
  if (!roomName || !host) {
    return res.rendirect('/home');
  }
  Meeting.queryConference(roomName, host, function (err, meeting){
    if(!err){

      if (meeting) {
        var result = [];
        meeting.MarkdownList.forEach(function (md){
          result.push(md);
        });
        return res.json({response:"query-markdown-success", mdArr : result});
      } else {
        console.log('query-meeting-md, null');
        return res.json({response:"query-markdown-success", mdArr: null});
      }
    } else {
      console.log('query-metting-md err', err);
      return res.json({response:"query-markdown-success", mdArr: null});
    }
  });
});

router.post('/archive-markdown', function (req, res){
  // markdown id
  //roomName, host, get from session
  var roomName = req.session.roomName || "",
      host = req.session.host || "",
      author = req.session.username || "author";

  Meeting.saveMarkdown(roomName, host, author, function (err, result){
    if(!err){
      req.json({response : "archive-markdown-success"});
    }
  });
});

router.post('/upload-img', function (req, res){
  console.log('upload-img request comming');
  var target = {
    roomName : req.session.roomName || 'sbsbsb',
    host : req.session.host || 'sb',
    date : req.session.date || '2014/9/12',
    listName : req.body.request,
    page : req.body.page,
    img : compresser.uncompress(req.body.img),
  };
  // console.log(req.body.img);
  Meeting.saveImg(target, function (err, result){
    if(!err){
      return res.json({response : "upload-success", 
                       objectId : result._id, 
                       imgType: req.body.request});
    } else {
      console.log('upload-failed');
      return res.json({response: 'upload-failed'});
    }
  });
});

router.post('/refresh-img', function (req, res){
  var type = req.body.request;
  var roomName = req.session.roomName;
  var host = req.session.host;
  var date = req.session.date;

  if (!type || !roomName || !host || !data) {
    return res.json({response : "refresh-success", SketchList : null});
  }
  Meeting.queryHistory(roomName, host, date, function (err, conference){
    if(!err){
      var resList = [];
      console.log(conference.ChartList);
      if(type === "chart"){
        if (conference.ChartList.length == 0) {
          return res.json({response: 'refresh-success', ChartList: null});
        }
        resList = conference.ChartList;
        console.log('chart type');
        return res.json({response : "refresh-success", ChartList : resList});
      }
      else if(type === "sketch"){
        if (conference.SketchList.length == 0) {
          return res.json({response: 'refresh-success', SketchList: null});
        }
        resList = conference.SketchList;
        console.log('sketch type');
        return res.json({response : "refresh-success", SketchList : resList});
      }
      else {
        console.log('err type');
        return res.json({response: "refresh-failed", SketchList: null});
      }
    }
  });
});

router.post('/query-img', function (req, res){
  console.log(req.body.objectId);
  var objId = new ObjectID(req.body.objectId);

  Meeting.queryImg(objId, function (err, image){
    if(!err){
      image.img = compresser.compress(image.img);
      return res.json({response : "query-img-success", image : image});
    }
  });
});


module.exports = router;