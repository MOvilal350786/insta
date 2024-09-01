HQ instagram clone

router.get("/like/:postid", async function (req, res) {
  const post = await postModel.findOne({ _id: req.params.postid });
  const user = await userModel.findOne({ username: req.session.passport.user });
  if (post.like.indexOf(user._id) === -1) {
    post.like.push(user._id);
  } else {
    post.like.splice(post.like.indexOf(user._id), 1);
  }
  await post.save();
  res.json(post);
});


router.get("/feed", isLoggedIn, async function (req, res) {
  let user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");

  let stories = await storyModel.find({ user: { $ne: user._id } })
  .populate("user");

  var uniq = {};
  var filtered = stories.filter(item => {
    if(!uniq[item.user.id]){
      uniq[item.user.id] = " ";
      return true;
    }
    else return false;
  })

  let posts = await postModel.find().populate("user");

  res.render("feed", {
    footer: true,
    user,
    posts,
    stories: filtered,
    dater: utils.formatRelativeTime,
  });
});





router.get("/profile/:user", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });

  if (user.username === req.params.user) {
    res.redirect("/profile");
  }

  let userprofile = await userModel
    .findOne({ username: req.params.user })
    .populate("posts");

  res.render("userprofile", { footer: true, userprofile, user });
});



router.get("/profile", isLoggedIn, async function (req, res) {
  let user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts")
    .populate("saved");
  console.log(user);

  res.render("profile", { footer: true, user });
});

router.get("/edit", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("edit", { footer: true, user });
});
//ccccccccccccc
router.get("/upload", isLoggedIn, async function (req, res) {

  res.render("upload", { footer: true});
});


router.get("/follow/:userid", isLoggedIn, async function (req, res) {
  let followKarneWaala = await userModel.findOne({
    username: req.session.passport.user,
  });

  let followHoneWaala = await userModel.findOne({ _id: req.params.userid });

  if (followKarneWaala.following.indexOf(followHoneWaala._id) !== -1) {
    let index = followKarneWaala.following.indexOf(followHoneWaala._id);
    followKarneWaala.following.splice(index, 1);

    let index2 = followHoneWaala.followers.indexOf(followKarneWaala._id);
    followHoneWaala.followers.splice(index2, 1);
  } else {
    followHoneWaala.followers.push(followKarneWaala._id);
    followKarneWaala.following.push(followHoneWaala._id);
  }

  await followHoneWaala.save();
  await followKarneWaala.save();

  res.redirect("back");
});




router.post("/post", isLoggedIn, upload.single("image"), async function (req, res) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    if (req.body.category === "post") {
      const post = await postModel.create({
        user: user._id,
        caption: req.body.caption,
        picture: req.file.filename,
      });
      user.posts.push(post._id);
    } else if (req.body.category === "story") {
      let story = await storyModel.create({
        story: req.file.filename,
        user: user._id,
      });
      user.stories.push(story._id);
    } else {
      res.send("tez mat chalo");
    }

    await user.save();
    res.redirect("/feed");
  }
);



router.post("/upload", isLoggedIn, upload.single("image"), async function (req, res) {
    const user = await userModel.findOne({username: req.session.passport.user,});
    user.picture = req.file.filename;
    await user.save();
    res.redirect("/edit");
  }
);


router.get("/search/:user", isLoggedIn, async function (req, res) {
  const searchTerm = `^${req.params.user}`;
  const regex = new RegExp(searchTerm);

  let users = await userModel.find({ username: { $regex: regex } });

  res.json(users);
});



const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  caption: String,
  like: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  comments: {
    type: Array,
    default: []
  },
  date: {
    type: Date,
    default: Date.now
  },
  shares: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  picture: String
})



const storySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  story: String,
  date: {
    type: Date,
    default: Date.now
  }
})


//!!!!!!!!!!!!!!!!!!!utils.js routes !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

var utils = {
    formatRelativeTime: function (date) {
        const now = new Date();
        const diff = now - date;
      
        // Convert milliseconds to seconds
        const seconds = Math.floor(diff / 1000);
      
        if (seconds < 60) {
          return `${seconds}s`;
        }
      
        const minutes = Math.floor(seconds / 60);
      
        if (minutes < 60) {
          return `${minutes}m`;
        }
      
        const hours = Math.floor(minutes / 60);
      
        if (hours < 24) {
          return `${hours}h`;
        }
      
        const days = Math.floor(hours / 24);
      
        if (days < 7) {
          return `${days}d`;
        }
      
        const weeks = Math.floor(days / 7);
      
        return `${weeks}w`;
      }
}
module.exports = utils;