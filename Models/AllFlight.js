const mongoose=require('mongoose');


let allfligtschema=new mongoose.Schema({
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
    time:{
        type:String,
        required:true
    },
   
    fare:{
        type:Number,
        required:true
    },
    flightclass:{
        type:String,
        required:true
    },

    flightseat:{
        type:Number,
        default:60
    }
})
module.exports=mongoose.model('AllFlight',allfligtschema)