const mongoose=require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/insta");
const plm=require('passport-local-mongoose');

const userSchema = mongoose.Schema({
  username:String,
  name:String,
  email:String,
  password:String,
  Bio:String,
  ProfileImage:String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post'
  }]
});

userSchema.plugin(plm);//by this line we provide serializeUser and deserializeUser 

module.exports = mongoose.model('user', userSchema);//by this line in database we can create read update delete kar payengen