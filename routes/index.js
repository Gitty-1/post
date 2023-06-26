var express = require('express');
var router = express.Router();

//导入 lowdb
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(__dirname + '/../data/post_message.json');
//获取 db 对象
const db = low(adapter);

// 导入shortid
const shortid = require('shortid')


/* GET home page. */

let error = ""

router.get('/', function(req, res, next) {
  let accounts = db.get('accounts').value()
  res.render('load', {error})
  error = ""
});

// 注册对应路由
router.get('/register', function(req, res, next) {
  res.render('register', {error})
})
router.post('/success_register', function(req, res, next) {
  var account = req.body.account
  var password = req.body.password
  if(account === "" || password === "") {
    error = "用户名或密码不能为空"
    res.redirect('/register')
    return
  }
  let accounts = db.get('accounts').find({account: account}).value()
  if(!accounts) {
    db.get('accounts').unshift({account: account, password: password}).write()
    res.render('success', {msg: '注册成功'})
  }
  else {
    error = "用户已存在"
    console.log(error)
    res.redirect('/register')
    return
  }
})

router.post('/post', function(req, res, next) {
  var account = req.body.account
  var password = req.body.password
  if(account === "" || password === "") {
    error = "用户名或密码不能为空"
    res.redirect('/')
  }
  let post = db.get('post_message').value()
  let accounts = db.get('accounts').find({account: account, password: password}).value()
  // console.log(accounts)
  if(accounts) {
    res.render('bbs', {post, accounts})
  }
  else {
    error = "用户名或密码不正确"
    res.redirect('/')
  }
});


router.get('/post/:id', function(req, res, next) {
  let id = req.params.id
  console.log(id)
  let item = db.get('post_message').find({id:id}).value()
  res.render('showitem', {item})
});

router.get('/delete/:arr', function(req, res, next) {
  let arr = req.params.arr
  console.log(arr)
  let newArr = arr.split(',')
  console.log(newArr[1])
  for(var i=0;i<newArr.length;i++)
  {
    db.get('post_message').remove({id: newArr[i]}).write()
  }
  res.render('success', {msg: '删除成功'})
})

router.get('/sendMsg', function(req, res, next) {
  let title = req.query.title
  let text = req.query.text

  let id = shortid.generate()
  let dates = new Date()
  let year = dates.getFullYear()
  let month = dates.getMonth() + 1
  let day = dates.getDate()
  if(month < 10) {
    month = '0' + month
  }
  if(day < 10) {
    day = '0' + day
  }
  let date = `${year}-${month}-${day}`
  let obj = {
    id: id,
    title: title,
    content: text,
    date: date
  }
  db.get('post_message').unshift(obj).write()
  res.render('success', {msg: '发布成功'})
})

module.exports = router;
