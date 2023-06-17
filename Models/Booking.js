const mongoose=require('mongoose');


let bookingschema=new mongoose.Schema({
    ticketno:{
        type:String,
        required:true
    },
    airlines:{
        type:String,
        required:true
    },
    flightname:{
        type:String,
        required:true
    },
    source:{
        type:String,
        required:true
    },
    destination:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
   
   
    age:{
        type:Number,
        required:true
    },
    firstname:{
        type:String,
        required:true
    },

    lastname:{
        type:String,
        required:true
    },
    usermail:{
        type:String,
        required:true
    }
})
module.exports=mongoose.model('Booking',bookingschema)