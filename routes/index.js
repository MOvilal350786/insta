var express = require("express");
var router = express.Router();

const passport = require("passport");
const localStrategy = require("passport-local");

const userModel = require("./users");
const postModel = require("./posts");

// const storyModel = require("./story");

passport.use(new localStrategy(userModel.authenticate()));

const upload = require("./multer");
// const utils = require("../utils/utils");


// GET ccccccccccccccccccccccccc
router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

//CCCCCCCCCCCCCCCCC
router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});


//feed CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
router.get('/feed', isloggedIn, async function(req, res){
  const user=await userModel.findOne({username:req.session.passport.user});
  const posts=await postModel.find().populate('user')//user:{type:mongoose.Schema.Types.ObjectId,ref:'user'}, => this is in postMOdel

  
  res.render("feed", {footer:true, posts, user});
});

///CCCCCCCCCCCCCCCCCCCCCCC
router.get('/profile', isloggedIn, async function(req, res){
const user=await userModel.findOne({username:req.session.passport.user}).populate('posts');// all users of (posts array) actual post of these users can be seen by separately login posts:[{type:mongoose.Schema.Types.ObjectId,  ref:'post'}]
const posts=await postModel.find().populate('user');// all posts of this user can be seen // /user:{type:mongoose.Schema.Types.ObjectId,ref:'user'}, => this is in postMOdel

  res.render('profile', {user, footer:true, posts});
});

router.get('/edit', isloggedIn, async function(req, res){
  const user= await userModel.findOne({username:req.session.passport.user}).populate('posts');
  res.render('edit', {footer:true, user});
});

router.post('/update', upload.single('image'), async function(req, res){

  const user= await userModel.findOneAndUpdate(
    {username:req.session.passport.user},
    {username:req.body.username, name:req.body.name, Bio:req.body.Bio},
    {new: true});

    if(req.file){
      user.ProfileImage = req.file.filename;
    }

  await user.save();
  res.redirect("/profile");
});
          router.post("/upload",  upload.single("images"), async function(req, res, next){
          const user= await userModel.findOne({username:req.session.passport.user});

          const post=await postModel.create({
          picture:req.file.filename,
          caption: req.body.caption,
          user:user._id//const user= await userModel.findOne({username:req.session.passport.user});

          });
          user.posts.push(post._id);// by it user will know post that is created by users
          await user.save();
          res.redirect('/feed')
        });

router.get("/upload", isloggedIn, async function(req, res){
  const user= await userModel.findOne({username:req.session.passport.user});
  res.render('upload', {footer: true, user})
});





router.get("/search", isloggedIn, async function (req, res) {
const user=await userModel.findOne({username: req.session.passport.user});

  res.render("search", { footer: true, user});
});

router.get("/username/:username", isloggedIn, async function (req, res) {

  const regex = new RegExp(`^${req.params.username}`, 'i');
  const users = await userModel.find({username: regex});
  res.json(users);
//  res.render('search', {users});
});





router.get("/likes/post/:id", isloggedIn, async function (req, res) {

  const user = await userModel.findOne({username:req.session.passport.user});
  const post = await postModel.findOne({_id:req.params.id});

  //if already liked remove like otherwise like it

  if(post.likes.indexOf(user._id)===-1){
    post.likes.push(user._id);
  }
  else
  {
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }

  await post.save();
  res.redirect('/feed');
  
 
});








// POST CCCCCCCCCCCCCCCCCCCC

router.post("/register", function (req, res) {
  const user = new userModel({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
  });

  userModel.register(user, req.body.password)//this returns promise
.then(function (registereduser) {// that promise immediately call 
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});


// //CCCCCCCCCCCCCCCCC
router.post("/login", passport.authenticate("local", {
successRedirect: "/profile",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

//CCCCCCCCcccccccccccccccccccc
router.get("/logout",  function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

//ccccccccccccccccccccccccccccccccccccccccccccccc
function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
