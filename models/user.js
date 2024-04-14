const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, required:true},
    email: {type: String, required:true, unique:true},
    // unique:true will create an index for the email which will speed up the querying process when requesting the email
    password: {type:String, required:true, minlength: 6},
    image: {type:String, required:true},
    // places: {type:String, required:true}
    places: [{type: mongoose.Types.ObjectId, required:true, ref: 'Place'}]
})

// userSchema.plugin(uniqueValidator)
//uniqueValidator pckg ensures that identical email addresses cannot be input

userSchema.pre('save', async function (next) {
    const model = this.constructor;
    // const existingDoc = await model.findOne({ uniqueField: this.uniqueField });
    const existingDoc = await model.findOne({ email: this.email });

    if (existingDoc && existingDoc._id.toString() !== this._id.toString()) {
        const error = new Error('Duplicate email value');
        // You can add more specific details to the error if needed
        error.field = 'email'; // Adding a field property to identify the problematic field
        next(error);
    } else {
        next();
    }
});

module.exports = mongoose.model('User', userSchema);
