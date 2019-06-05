const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const userSchema=new mongoose.Schema({
  //id:Number,
  name:{
  	first:String,
  	last:{type:String,trim:true}
  },
  email:{
    type:String,
    required:true
  },
  phone:{
    type:Number,
    required:true
  },
  unattended_deliveries:Number,
  password:{
    type:String,
    required:true
  },
  coupon_last:{
    type:Date
  }

});

var users=mongoose.model('users',userSchema);
module.exports={
	users
};
