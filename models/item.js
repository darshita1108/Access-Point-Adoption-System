const mongoose=require('mongoose');
const Schema=mongoose.Schema;


var itemSchema=new mongoose.Schema({
 length:Number,
 breadth:Number,
 height:Number,
 price:Number,
 category:String,
});

var items=mongoose.model('items',itemSchema);

module.exports={
	items
};