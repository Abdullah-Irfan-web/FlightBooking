const mongoose=require('mongoose');

let travellerschma=new mongoose.Schema({
    usermail:{
        type:String,
        required:true
    },
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true,
    },
    age:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    }

})

module.exports=mongoose.model('Traveller',travellerschma);