const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const placeSchema = new Schema ({
    title: {type:String, required:true},
    description: {type:String, required:true},
    image: {type:String, required:true},
    address: {type:String, required:true},
    // location: {
    //     lat: {type:Number, required:true},
    //     lng: {type:Number, required:true}
    // },
    // creator: {type:String, required:true}
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User'}
    // with the type, the creator will be a real id  
    //ref allows to establish the current schema with another 

})


module.exports = mongoose.model('Place', placeSchema);



