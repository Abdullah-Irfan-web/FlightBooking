const express=require("express");
const app=express();
const path=require("path");
const bodyparser=require("body-parser");
const mongoose=require('mongoose');
const PORT=process.env.PORT||3000;
const dotenv=require("dotenv");
const shortid=require("shortid");
const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy
const bcrypt=require('bcryptjs');
const session=require('express-session');
const AllFlight=require('./Models/AllFlight');
const Traveller=require('./Models/Traveller');
const Booking=require('./Models/Booking');
const user=require('./Models/User')

app.set('view engine','ejs');

app.set('views',path.join(__dirname,'views'));
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.json());

dotenv.config({path:'./config.env'})

//  Database Connection
const DB=process.env.DATABASE

mongoose.connect(DB,{
    useNewUrlParser:true,

   
});

const db=mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

    console.log("Connected");
});


//PASSPORT SETUP
passport.use(new LocalStrategy({usernameField:'email'},(email,password,done)=>{
    user.findOne({email:email})
    .then(userr=>{
        if(!userr){
            return done(null,false)
        }
        bcrypt.compare(password,userr.password,(err,isMatch)=>{
            if(isMatch){
                return done(null,userr)
            }
            else{
                return done(null,false)
            }
        })
    })
    .catch(err=>{
        console.log(err);
    })
}))


app.use(session({
    secret:"Node",
    resave:true,
    saveUninitialized:true
}))


passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.name ,role:user.role});
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });
app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next)=>{
   
    res.locals.currentUser=req.user;
    next();
});



function ensureauthentication(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

function ensureadminauthentication(req,res,next){
    if(req.isAuthenticated() && req.user.role==='admin'){
        return next();
    }
    res.redirect('/login');
}


//Home
app.get('/',async(req,res)=>{
   let currentUser=req.user;
   if(currentUser===undefined){
   currentUser="";
   }
   console.log(req.user);
  
   let res1=await AllFlight.find({flightseat: { $gt: 0 } }).distinct("source");

   let res2=await AllFlight.find({flightseat: { $gt: 0 } }).distinct("destination");
   res.render('home',{flightS:res1,flightD:res2,currentUser:currentUser});
   
    

})
// Register
app.get('/register',(req,res)=>{
    res.render('register');
})
//Login
app.get('/login',(req,res)=>{
    res.render('login');
})
//logout
app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
  });

//booking
app.get('/booking/:id',ensureauthentication,(req,res)=>{
    let id=req.params.id;
    
    Traveller.find({usermail:req.user.username})
    .then(traveller=>{
        res.render('booking',{flightid:id,traveller:traveller});
    })
    
})
app.get('/deltravel/:id1/:id2',ensureauthentication,(req,res)=>{
    let travelid=req.params.id1;
    let flightid=req.params.id2;
    let serachquery={_id : travelid};
    Traveller.deleteOne(serachquery)
    .then(result=>{
        res.redirect(`/booking/${flightid}`);
    })

})

app.get('/bookflight/:id',ensureauthentication,async(req,res)=>{
  let flightdetail= await  AllFlight.findOne({_id:req.params.id});
  let userdetail=await Traveller.find({usermail:req.user.username});
 
    userdetail.forEach((user)=>{
        flightdetail.flightseat--;
        let bookingdata={
            ticketno:shortid.generate(),
            airlines:flightdetail.airlines,
            flightname:flightdetail.flightname,
            source:flightdetail.source,
            destination:flightdetail.destination,
            date:flightdetail.date,
            age:user.age,
            firstname:user.firstname,
            lastname:user.lastname,
            usermail:user.usermail
        }
        Booking.create(bookingdata)
        .then(result=>{

        })
    });
    flightdetail.save();
    
    
    
        res.render('bookingconfirm',{flight:flightdetail,userdetail:userdetail});
    
   
})

app.get('/mybooking',ensureauthentication,(req,res)=>{
    Booking.find({usermail:req.user.username})
    .then(mybooking=>{
      
        res.render('mybooking',{booking:mybooking})
    })
})

   

//flights
app.get('/flight',ensureauthentication,(req,res)=>{
    res.render('flight')
})
//admin
app.get('/admin',ensureadminauthentication,(req,res)=>{
    AllFlight.find({})
    .then(flights=>{
        res.render('admin',{flights:flights});
    })
    
})
app.get('/admin/del/:id',ensureadminauthentication,(req,res)=>{
    AllFlight.deleteOne({_id:req.params.id})
    .then(flight=>{
        res.redirect('/admin');
    })
})
app.get('/admin/allbookings',ensureadminauthentication,(req,res)=>{
    Booking.find({})
    .then(flight=>{
        res.render('adminallbooking',{booking:flight})
    })
   
})
app.get('/admin/addflight',ensureadminauthentication,(req,res)=>{
    res.render('addflight')
})

app.get('/admin/edit/:id',ensureadminauthentication,(req,res)=>{
    AllFlight.findOne({_id:req.params.id})
    .then(data=>{
        res.render('adminedit',{data:data})
    })
})



//POST Requests

app.post('/searchflight',(req,res)=>{
    let currentUser=req.user;
   if(currentUser===undefined){
  return res.redirect('/login');
   }
  
    let source=req.body.source;
    let destination=req.body.destination;
    let date=String(req.body.date);
    let flightclass=req.body.seatclass;
    AllFlight.find({$and:[{source:source},{destination:destination},{date:date},{flightclass:flightclass}]})
    .then(flight=>{
       res.render('flight',{flightdata:flight});
    })

})

app.post('/addtravel',(req,res)=>{
    let flightid=req.body.idvalue;
    let adddata={
        usermail:req.user.username,
        firstname:req.body.fname,
        lastname:req.body.lname,
        age:req.body.age,
        email:req.body.email,
        gender:req.body.gender
    }
        Traveller.create(adddata)
        .then(data=>{
            res.redirect(`/booking/${flightid}`);
        })
    
})
app.post('/admin/addflight',(req,res)=>{
    let flightdata={
        airlines:req.body.airline,
        flightname:req.body.flightname,
        source:req.body.source,
        destination:req.body.destination,
        date:String(req.body.date),
        time:req.body.time,
        fare:req.body.fare,
        flightclass:req.body.flightclass
    }
    AllFlight.create(flightdata)
    .then(flight=>{
        res.redirect('/admin');
    })
})

app.post('/admin/edit/:id',(req,res)=>{
    let searchquery={_id:req.params.id};
    AllFlight.updateOne(searchquery,{$set:{
        airlines:req.body.airline,
        flightname:req.body.flightname,
        source:req.body.source,
        destination:req.body.destination,
        date:String(req.body.date),
        time:req.body.time,
        fare:req.body.fare,
        flightclass:req.body.flightclass
    }})
    .then(resul=>{
        res.redirect('/admin');
    })
})

app.post('/register',(req,res)=>{
    const{name,email,password}=req.body;
    user.findOne({$or:[{name:name},{email:email}]})
    .then(userr=>{
        if(userr){
           
            return res.send("User already Exist !!")
        }

       
        const newuser=new user({
            name:name,
            email:email,
            password:password

        })
        bcrypt.genSalt(10,(err,salt)=>
        bcrypt.hash(newuser.password,salt,(err,hash)=>{
            if(err)
            throw err;
            newuser.password=hash;
           
        newuser.save()
        .then(userr=>{
           
            res.redirect('/login')
        })
        .catch(err=>{
            console.log(err);
        })
        })
        
        )


    })

})
const geturl = (req) => {
    return req.user.role === 'admin' ? '/admin' : '/'
}
app.post('/login',
    passport.authenticate('local'),
    function(req, res) {
     
      res.redirect(geturl(req));
    });


app.listen(PORT,()=>{
    console.log("Server started");
})