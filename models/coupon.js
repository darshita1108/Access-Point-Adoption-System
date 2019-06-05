const mongoose=require('mongoose');
const Schema=mongoose.Schema;

var couponSchema=new mongoose.Schema({
 code:String,
 type:Number,
 creation_date:{
 	type:Date,
 	default:Date.now,
 	required:true
 },
 expiry_date:{
 	type:Date,
 	default:Date.now,
 	required:true
 },
 used:{
 	type:Boolean,
 	default:false,
 	required:true
 },
 user_id:{
 	type:mongoose.Schema.Types.ObjectId,
 	required:true
 }
});

var coupons=mongoose.model('coupons',couponSchema);

module.exports={
	coupons
};