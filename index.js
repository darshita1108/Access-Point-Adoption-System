const mongoose = require('mongoose');
const couponCode = require('coupon-code');//generate unique coupon codes
const Promise = require('bluebird');//bluebird is for promise
var express=require('express');


const v = require('node-input-validator');
const app=express();



app.use('/static',express.static(__dirname + '/public'));
app.set('view engine', 'ejs')

app.get('/coupon',function(req,res){
	res.render('coupon');
});

app.get('/add',function(req,res){
  res.render('addAccessPoint1');
});

app.get('/user',function(req,res){
  res.render('user');
});
app.get('/home',function(req,res){
  res.render('home');
});
app.get('/',function(req,res){
 res.render('first');
});
app.get('/admin',function(req,res){
  res.render('adminlogin');
});


app.get('/adduser',function(req,res){
  res.render('user');
});

app.get('/addlocker',function(req,res){
  res.render('locker');
});

app.get('/orderstatus',function(req,res){
  res.render('orderstatus');
});
app.get('/findusers',function(req,res){
  res.render('findusers');
});
app.get('/additem',function(req,res){
  res.render('item');
});
app.get('/generate',function(req,res){
  res.render('generate');
});



const port = process.env.PORT || 3003;
app.listen(port,()=>{
  console.log('server started on port ${port}');
});

//connect to database
const keys=require('./config/keys');
mongoose.connect(keys.mongoURI);

const {users}=require('./models/user.js');
const {orders}=require('./models/order.js');
const {items}=require('./models/item.js');
const {lockers}=require('./models/locker.js');
const {coupons}=require('./models/coupon.js');
const {geo}=require('./models/geo.js');

var bodyParser = require('body-parser');



app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/admin',function(req,res){
var email=req.body.email;
var password=req.body.password;
if(email=='aggarwaldarshita@gmail.com'&&password=='admin123')
{
  res.render('admin.ejs');
}
else{
  res.send('not valid credentials');
}
});
app.post('/show',function(req,res){
  console.log(req.body.delivery);
  var r=req.body.delivery;
if(r=='locker')
{
res.render('findAccessPoint1',{
email:req.body.email,
price:req.body.price
});
}
else{
  res.render('created',{
    r:'You choose cash on delivery!!'
  })
}
});
///geocoder////
var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'opencage',//google
  httpAdapter: 'https', // Default
  apiKey: keys.key, // for Mapquest, OpenCage, Google Premier
  formatter: null        // 'gpx', 'string', ...
};

var geocoder=NodeGeocoder(options);

   app.post("/addlocker", function(request, response) {

       console.log(request.body); 
  lockers.findOne({
      locker_id:request.body.locker_id,
    }).then(locker=>{
      if(locker)
      {
      response.render('created.ejs',{
          r:'Already exists!'
        });
      }
      else{
        geocoder.geocode(request.body.address)
      .then(function(res) {
       console.log(res);
       console.log(res[0].latitude);
       var latitude=res[0].latitude;
       var longitude=res[0].longitude;
       new lockers({
       locker_id:request.body.locker_id,
       length:request.body.length,
       breadth:request.body.breadth,
       height:request.body.height,
       address:request.body.address,
       latitude:latitude,
       longitude:longitude
        })
        .save()
        .then(console.log('saved'));
        console.log("running");
       })
       .catch(function(err) {
    console.log(err);
      });
       response.render('created.ejs',{
          r:'Done!!'
        });
      }
    });
     
 });
   
//distance between 2 locations
app.post('/accessList', function (req, res) { // code that will execute in background when address submitted
  // for saving access points to db
  // forward geocoding needs to be done
  // error handling for empty inputs
  let validator = new v( req.body, {
        A1:'required',
        A2:'required',
        A3:'required',
        A4:'required',
        Amode:'required',
        Atitle:'required',
        length:'required',
        breadth:'required',
        height:'required',
        Awt:'required',
        Arate:'required',
        Atype:'required',
        Nname: 'required'
    });
 
    validator.check().then(function (matched) {
        if (!matched) {
            res.status(422).send(validator.errors);
        }
        else
        {
          //address
          var str1 = req.body.A1; //street
          var str2 = req.body.A2; //city
          var str3 = req.body.A3; //state
          var str4 = req.body.A4; //country
          var str = str1 + " " + str2 +" " +str3+" "+str4;
          // getting country name in lower case to add to the collection of that country only in db
          //var coll = changeCase.upperCase(str4);
          //locker no.
          var no = req.body.Nname;
          var x= parseInt(no,10);
          //mode
          var str5 = req.body.Amode;
          //name
          var str6 = req.body.Atitle;
          //dimensions
          var str7 = req.body.Adim;
          //weight limit
          var str8 = req.body.Awt;
          var x1= parseInt(str8,10);
          //rate
          var str9= req.body.Arate;
          var x2= parseInt(str9,10);
          //type
          var str10 = req.body.Atype;
          //code for checking uniqueness and saving access point
          console.log(str);
          geocoder.geocode(str, function(err, res) { //req.body.Aname  '29 champs elysée paris'
          console.log(res);
          console.log("********************");
          var lat = res[0].latitude; // to get lattitude of address
           var lon = res[0].longitude; // to get longitude of address
          console.log('lat : '+ lat+' long: '+lon+' address '+str + ' no. '+x);
          console.log("%%%%%%%%%%%%%%%%");
          // we will search for an existing entry of that access point in that country's collection
          geo.find({address:str
            },function(err,final){
              if(err)
                console.log(err);
              console.log(final);
              if(final.length>0){
                // access point already exists hence no change made in db
                console.log('This access point exists, we will not add it again');
              }
              else{
                var item = new geo ({
                address:str,
                latt:lat,
                lonn:lon,
                lock:x,
                state : str3,
                country : str4,
                mode : str5,
                name : str6,
                length:req.body.length,
                breadth:req.body.breadth,
                height:req.body.height,
                weight : x1,
                rate : x2,
                type : str10
                });
                item.save(function(err,save){
                  if(err)
                    console.log(err);
                    //No such access point exists , hence access point saved
                  console.log(save);
                  console.log('access point saved');
                });
              }
              
             //res.end(); // redirects to main page
            });
          //res.redirect('/'); 
        });
      }
      res.render("created",{
        r:'created'
      });
      });
});

app.post('/lockerList', function (req, res) {
  //forward geocoding needs to be done
  // need to find the geocode of address and add the no. of lockers to previous numbers in it
   // error handling for empty inputs
   let validator = new v( req.body, {
        A1:'required',
        A2:'required',
        A3:'required',
        A4:'required',
        Nname1: 'required'
    });
 
    validator.check().then(function (matched) {
        if (!matched) {
            res.status(422).send(validator.errors);
        }
        else
        {
          //address
          var str1 = req.body.A1; //street
          var str2 = req.body.A2; //city
          var str3 = req.body.A3; //state
          var str4 = req.body.A4; //country
          var str = str1 + " " + str2 +" " +str3+" "+str4;
          geo.find({
          address : str
        },function(err,final){
          if(err)
            console.log(err);
            console.log(final);
            if(final.length>0){
              final[0].lock = final[0].lock+parseInt(req.body.Nname1,10);
              final[0].save();
              console.log("iteam updated");
            }
            else{
              console.log("access point not exist");
            }
            res.redirect('/'); // redirects to main page
          });
        }

    });
});
app.get('/lockerList',function(req,res){
  // that result show case or code to be shown to user
  //res.redirect('/');
  res.end();
});


var rad = function(x) {
  return x * Math.PI / 180;
};
 var getDistance = function(p1lat, p1lng, p2lat, p2lng) {
   // returns the distance in kilometer
   var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2lat - p1lat);
  var dLong = rad(p2lng - p1lng);
  // console.log(dLat);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1lat)) * Math.cos(rad(p2lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  d = d/1000;
  return d;
};

var arr = []; 
app.post('/search', function (req, response) { // code that will execute in background when address submitted
  // for searching nearby Access Points
  // backward geocoding needs to be done
  //convert address provided by user to geocode 

  arr = [];

  //for exception of empty input
  let validator = new v( req.body, {
        range: 'required',
        A1 : 'required',
        A2 : 'required',
        A3 : 'required',
        A4 : 'required',
        Mode : 'required',
        Type : 'required',
        Partition : 'required'
    });
 
    validator.check().then(function (matched) {
        if (!matched) {
            response.status(422).send(validator.errors);
        }
        else
        {
          //address
          var str1 = req.body.A1;//street
          var str2 = req.body.A2;//city
          var str3 = req.body.A3;//state
          var str4 = req.body.A4;//country
          var str = str1 + " " + str2 +" " +str3+" "+str4; //address
          // mode
          var smode = req.body.Mode;
          console.log('mode', smode);
          //type
          var stype = req.body.Type;
          //partition
          var spart = req.body.Partition;
          //finding lat and lon
          geocoder.geocode(str, function(err, res) { //req.body.fName
          console.log(res);
           var lat = res[0].latitude; // to get lattitude of address
           var lon = res[0].longitude; // to get longitude of address
           var no = req.body.range;// to get the range 
           var x= parseInt(no,10);
           // console.log('lat= '+lat+' lon= '+lon+' address= '+str+' range '+x);
            
           // search nearest geocodes from database and return addresses as result
           //find every object in db and compare the distance``
          
           geo.find({}).then(function(result){// finding function for database
              var ct = 0;
              
              console.log(result.length); // no. of objects in database
              for(var i = 0; i<result.length ;i++)
              {
                  var ans = getDistance(lat,lon,result[i].latt,result[i].lonn); // finding distance between the query address and the db addresses
                  console.log(ans); // showing every distance in kilometers
                  if(ans <= x)
                  {
                    // those addresses which are in the range as described by user
                    console.log("Range "+ans+" "+x);
                    if(result[i].mode == smode && result[i].type == stype)
                    {
                      console.log("mode and type "+result[i].mode+" "+smode);
                      // those results which match user's prefrence
                      if(spart=='None')
                      {
                        // those results which match the partition
                        console.log('Partition is none');
                        //hence all the results need to be shown
                        ct++;
                        arr.push(result[i]); // pushed all the results in the array for next webpage
                        console.log(result[i]);
                      }
                      else if(spart=='Country')
                      {
                        console.log('Partition is Country');
                        // results within country needs to be shown
                        if(str4 == result[i].country)
                        {
                          ct++;
                          arr.push(result[i]); // pushed all the results in the array for next webpage
                          console.log(result[i]);
                        }
                      }
                      else
                      {
                        console.log('Partition is State');
                        //results within same state needs to be pushed
                        if(str3 == result[i].state)
                        {
                          ct++;
                          arr.push(result[i]); // pushed all the results in the array for next webpage
                          console.log(result[i]);
                        }
                      }
                    }
                    // ct++;
                    // arr.push(result[i]); // pushed all the results in the array for next webpage
                    // console.log(result[i]);
                  }
              }
              console.log("arr is filled: ", arr);
              console.log(req.body.price);
              response.render("nearestAccess",{
                arr:arr,
                email:req.body.email,
                price:req.body.price
              });
          });
         //res.send('/nearest',{response:arr});
         //res.send(arr);
         });
        }
    });

  });


app.post("/find",function(req,response){
console.log(req.body.address);
var lat1=req.body.latitude;
var long1=req.body.longitude;

geocoder.geocode(req.body.address)
      .then(function(res) {
       console.log(res);
       console.log(res[0].latitude);
       var lat2=res[0].latitude;
       var long2=res[0].longitude;
       var r=getDistance(lat1,long1,lat2,long2);
       response.send('The distance is '+r);
       })
       .catch(function(err) {
    console.log(err);
      });
});

   app.post("/additem", function(request, response) {
       var newitem={
       item_id:request.body.item_id,
       length:request.body.length,
       breadth:request.body.breadth,
       height:request.body.height,
       price:request.body.price,
       category:request.body.category,
    }
 items.findOne({
      item_id:request.body.item_id
    }).then(item=>{
      if(item)
      {
         response.render('created.ejs',{
          r:'Already exists!!'
        });
      }
      else{
        //create user
       new items(newitem)
        .save()
        .then(console.log('saved'));
         response.render('created.ejs',{
          r:'Done!!'
        });
      }
    });
 });

   app.post("/adduser", function(request, response) {
       console.log(request.body); 
       var newusers={
       name:{first:request.body.firstname,last:request.body.lastname},
       email:request.body.email,
       phone:request.body.phone,
       password:request.body.password,
       unattended_deliveries:0
    }
 users.findOne({
      email:request.body.email
    }).then(user=>{
      if(user)
      {
      
      }
      else{
       new users(newusers)
        .save()
        .then(console.log('saved'));
      }
    });
        items.find({}, function(err, data) {
        // note that data is an array of objects, not a single object!
        response.render('item_list.ejs', {
            email : request.body.email,
            fname:request.body.firstname,
            lname:request.body.lastname,
            items: data
        });
    });
      });
  
app.get('/login',function(request,response){
    response.render('login.ejs');
});

app.post('/login',function(request,response){
    var email=request.body.email;
    var password=request.body.password;
    console.log(email);
    console.log(password);
    users.findOne({
      email:email
    }).then(user=>{
      if(user)
      {
        if(password==user.password)
        {
          items.find({}, function(err, data) {
        // note that data is an array of objects, not a single object!
        response.render('item_list.ejs', {
            email : request.body.email,
            fname:request.body.firstname,
            lname:request.body.lastname,
            items: data
            });
          });
        }
        else{
         response.send('wrong password');
        }
      }
      else{
        response.send('not a user..sign up first');
      }
    });
});
app.post("/buy", function(request, response) {
       console.log(request.body); 
       var r='ordered';
       var neworders={
       email:request.body.email,
       status:r
        }
       new orders(neworders)
        .save()
        .then(console.log('saved'));

        items.find({}, function(err, data) {
        response.render('buy.ejs', {
            email : request.body.email,
            id:request.body.id,
            length:request.body.length,
            breadth:request.body.breadth,
            height:request.body.height,
            category:request.body.category,
            price:request.body.price
        });
      });
    });


app.post("/orderstatus", function(request, response) {
       console.log(request.body); 
        var myquery = { order_id: request.body.id };
        var newvalues = { $set: {status: request.body.status } };
        orders.updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
  });
    users.findOne({
      email:request.body.email
    }).then(user=>{
      if(user)
      {
        console.log(user);
        var myquery = { email: request.body.email };
        var newvalues = { $inc: {unattended_deliveries:1 } };
        if(request.body.status=='unattended'){
        users.updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
  });}
      }
    });
    response.render('created.ejs',{
      r:'updated'
    });
  });

//fucntion to check uniqueness of coupons
function check(code) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
    console.log("check"+code);
    coupons.findOne({
      code:code

    }).then(coupon=>{
      if (coupon) {
        console.log(code + ' is not unique');
        resolve(false);
      } 
      else {
        console.log(code + ' is unique');
        resolve(true);
      }
    }, 1000);
    });

  });
}
//fucntion to generate a new coupon
var generateUniqueCode = Promise.method(function() {
  var code = couponCode.generate({parts:3,partLen:5});
  return check(code)
    .then(function(result) {
      if (result) {
        return code;//if it is unique then return the code
      } else {
        return generateUniqueCode();//else generate a new code 
      }
    });
});
//using nodemailer
var nodemailer=require('nodemailer');
var transporter=nodemailer.createTransport({
service:'gmail',
auth:{
  user:'aggarwaldarshita@gmail.com',
  pass:keys.password
}
});

//coupons will be generated for the users
//the last coupon date of the user is taken if it is less than the date
//we are taking then they are included in targetted customers
//clong with cpupon a mail is send to the users.
app.post("/generate", function(request, response) {
      var threshold=request.body.threshold;
      var query = { unattended_deliveries: { $gt: threshold } };
      var count=request.body.count;

      users.find(query,function(err, result) {
      if (err) throw err;
      console.log(result);

      var m=result.sort(function(a, b){return b.unattended_deliveries - a.unattended_deliveries});
      for(var i=0;i<m.length;i++)
      {
        var user_last_coupon=m[i].coupon_last;
        if(user_last_coupon!=undefined)
        {
          user_last_coupon=new Date(user_last_coupon);
          var last_date=request.body.date;
          last_date=new Date(last_date);
          if(user_last_coupon>=last_date)
          {
           m.splice(i,1);
          }

        }
      }
      if(m.length>count)
      {
        m=m.slice(0,count);
      }
      for(var i=0;i<m.length;i++)
      {
        var user_last_coupon=m[i].coupon_last;
        console.log(user_last_coupon);
        var email=m[i].email;
        var type=request.body.type;
        var expiry=request.body.expiry;
        var used=false;
        var id=m[i]._id;
        m[i].coupon_last=new Date();
        console.log(m);
        var myquery = { email:email };
        var newvalues = {coupon_last:new Date()};
        users.updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
  });
        generateUniqueCode().then(function(code) {
          var mailOptions={
    from:'aggarwaldarshita@gmail.com',
    to:email,
    subject:'sending coupon code',
    html: '<p>Hello,we are prividing you a coupon code to use the lockers.</p>'+'<p>Your code is</p>'+code+'<p>It will expire on </p>'+expiry
   };
   transporter.sendMail(mailOptions,function(err,info){
       if(err){
        console.log(err);
       }
       else{
        console.log('email sent'+info.response);

       }
   });
        new coupons({
         code:code,
         user_id:id,
         expiry_date:expiry,
         type:type,
         used:used
        }).save()
          .then(console.log('saved'));
      });
    
      }
      console.log("m"+m);
      response.render('generate.ejs',{
      result:m,
     });
  });
  });

//all the available codes of the user will be listed
app.post("/available_codes",function(req,res){
console.log(req.body.price);
var email=req.body.email;
var price=req.body.price;
var user_id;
var m=[];
var query = {email:email};

users.find(query,function(err, result) {
    m=result;
  console.log(m[0]._id);
  var q={user_id:m[0]._id};
  coupons.find(q,function(err,result){
    console.log(result);
    for(var i=0;i<result.length;i++)
    {
      console.log(result[i].expiry_date);
      var expiry=result[i].expiry_date;
      expiry=new Date(expiry);
      if(expiry<new Date())
      {
        coupons.findOneAndRemove({code: result[i].code}, function(err){
            if(err)
              throw err;
          });
        result.splice(i,1);
      }
    }
      res.render('available_codes.ejs',{
        result:result,
        price:price
      })
  
      });
    });

});

//user will choose from the available coupons and the expired coupons will be checked
// the discounted price will be calculated

app.post('/applycode',function(request,response){
var code=request.body.code;
var price=request.body.price;
var type=request.body.type;
console.log("code"+code);
console.log(price);
coupons.findOne({
      code:code
    }).then(coupon=>{
      if(coupon)
      {
        var expiry=coupon.expiry_date;
        expiry=new Date(expiry);
        var date=new Date();
        if(expiry>date)
        {
          if(type==1)
          {
          price=(price)-((0.05)*price);
          }
          else if(type==2)
          {
         price=(price)-((0.1)*price);
          }
          else{
        price=(price)-((0.15)*price);
          }
          coupons.findOneAndRemove({code: code}, function(err){
            if(err)
              throw err;
          });
          response.render('created.ejs',{
            r:'Discounted price is '+price
          });

        }  
        else{
          response.render('created.ejs',{
            r:'Coupon has expired!'
          });
        }
      }
});
});

