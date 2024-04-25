const { v4: uuidv4 } = require('uuid');
const {validationResult} = require('express-validator')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/user');

const dummyPlaces = [
    {
        id: 'p1',
        title: 'Empire state building',
        description: 'one of the most famous sky scrappers in the world',
        location: {
            lat: 40.908423,
            lng: -73.987543
        },
        address: '30 B w wall street',
        creator: 'u1'
    },
    {
        id: 'p2',
        title: 'Empire state building',
        description: 'one of the most famous sky scrappers in the world',
        location: {
            lat: 40.908423,
            lng: -73.987543
        },
        address: '30 B w wall street',
        creator: 'u2'
    },
    {
        id: 'p3',
        title: 'Emp building',
        description: 'one of ers in the world',
        location: {
            lat: 40.908423,
            lng: -73.987543
        },  
        address: '30 B w wall street',
        creator: 'u2'
    }
];



const getPlaceById = async (req,res,next) => {
    const placeId = req.params.pid;
    
    // const place = dummyPlaces.find((p) => {
    //     return p.id === placeId;
    // });
    let place;

    try {
        place = await Place.findById(placeId);
    } catch(e) {
        const error = new HttpError("Something went wrong, couldn't find place", 500);
        return next(error)
    }
//findbyId() is a static method, which means it's not used on the instance of place but directly on the place constructor function.

 
    if (!place) {
        // return res.status(404).json({message:'Could not find requested place'})
        // const error = new Error('Could not find a place for the provided id')
        // error.code = 404
        // throw error;
        const error = new HttpError('Could not find a place for the provided id', 404);
        return next(error);
    }
    // res.json({place})
    res.json({place: place.toObject({getters:true})});
}

// function getPlaceById() {...}
// const getPlaceById = function() {...}


const getPlacesByUserId1 = (req, res, next) => {
    const userId = req.params.uid;
    const places = dummyPlaces.filter((p) => {
        return p.creator == userId;
    })
    if(!places || places.length === 0) {
        return next(
            new HttpError('Could not find place for the provided id', 404)
        )
    }
    res.json({places})
}


const getPlacesByUserId = async (req,res,next) => {
    const userId = req.params.uid;

    let userWithPlaces;
    try {
        // places = await User.find({creator: userId});
        userWithPlaces = await User.findById(userId).populate('places');
    } catch (e) {
        const error = new HttpError("Error fetching places for user id, please try again later", 500);
        return next(error);
    }

    if(!userWithPlaces || userWithPlaces.places.length === 0) {
        const error = new HttpError("Couldn't find places for the provided user", 404);
        return next(error)
    }

    res.json({places: userWithPlaces.places.map(place => place.toObject({getters:true}))});
}   





const createPlace = async (req,res,next) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        console.log(errors);
        return next(
            new HttpError('Invalid inputs passed, please check your data', 422)
        );
    }

    const {title, description, coordinates, address, creator} = req.body;
    
    // const createdPlace= {
    //     id: uuidv4(),
    //     title,
    //     description,
    //     location: coordinates,
    //     address,
    //     creator
    // };
    
    const createdPlace = new Place({
        title,
        description,
        // location:coordinates,
        address,
        image:req.file.path,
        creator
    });

    let user;
    try {
        user = await User.findById(creator)
    } catch(e) {
        const error = new HttpError('Creating place failed, please try again',500);
        return next(error)
    }

    if(!user) {
        const error = new HttpError('UserId not provided',500);
        return next(error)
    }
    console.log(user)


    try {
        // await createdPlace.save();

// if the user exists
//  - store/create the new doc with the new place
//  - add the place id corresponding user
// So only if both of the above conditions are true, the place and user will get updated.
// to do this we need to use transactions and session
//  - transaction allows to perform multiple operations in isolation of each oither
//  and undo these
// and the transactions are built on sessions.
        const sess = await mongoose.startSession();
        sess.startTransaction();
            await createdPlace.save({session :sess});//with this the new place is created with a unique id created by mongoose
            user.places.push(createdPlace);//the 'push' here is a mongoose method which allows-
        // -mongoose to establish a connection between the 2 models we're referring here.
            await user.save({session: sess})// this updated user should be a part of the current session that we're referring to.
        await sess.commitTransaction();

//When it comes to transactions in mongoose, the collections have to be made manually and they aren't made automatically.

    }catch(e) {
        console.log(e)
        const error = new HttpError('Failed to parse data', 500);
        return next(error);
    }
    // dummyPlaces.push(createdPlace)
    // res.status(201).json({createdPlace});
    res.status(201).json({ place: createdPlace });




    // let token;

    // try {    
    // token = jwt.sign(
    //     {place: createPlace},
    //     "secretKey",
    //     { expiresIn: "1h" }
    //   );
    // } catch (e) {
    //   const error = new HttpError("Failed to create place", 500);
    //   return next(error);
    // }

    // res
    //   .status(201)
    //   .json({ 
    //     place: createPlace,
    //     token 
    //   });


};



const updatePlaceById = async (req,res,next) => {
    //Error Validation with Express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs passed, please check your data.', 422);
    }

    const {title, description} = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch(e) {
        const error = new HttpError('PlaceId not found, could not update place', 500);
        return next(error);
    }

//creator's id should be matched the userId tied to the req body in the jwt - check-auth.js

    if(place.creator.toString() !== req.userData.userId){
//what's inside of .creator is not a string that'll equal the userId in req.userData.userId
//but instead it's an object of type mongoose objectId. So we need to convert it to 
//a string by the calling .toString method.
            const error = new HttpError(
                'You are not allowed to edit this place',
                401
            );
            return next(error);
    }

    place.title = title;
    place.description = description;

//updated infor. should be stored in the db
    try {
        await place.save();
    } catch {
        const error = new HttpError('Something went wrong, could not update place', 500);
        return next(error);
    }

    res.status(200).json({place: place.toObject({getters:true})});
}





// const deletePlaceById1 = (req,res,next) => {
//     const placeId = req.params.pid;
//     dummyPlaces = dummyPlaces.filter(p => p.id !== placeId)
//     res.status(200).json({message:'deleted'});
// }



const deletePlaceById1 = async (req,res,next) => {
    const placeId = req.params.pid;
    const place = dummyPlaces.find((p) => {
        return p.id === placeId
    })
    
    if (!place) {
        throw HttpError('Error deleting place')
    }
    
    const placeIndex = dummyPlaces.findIndex((p) => {
        return p.id === placeId
    })
    dummyPlaces.splice(placeIndex, 1)
    
    res.status(200).json({message: 'deleted'})

}



const deletePlaceById = async (req,res,next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
        // userWithPlaces = await User.findById(userId).populate('places');
    }catch(e) {
        console.log(e)
        const error = new HttpError('Something went wrong, could not delete place', 500);
        return next(error);
    }


    if(!place) {
        const error = new HttpError("Couldn't find place to delete", 404);
        return next(error);
    }

    if(place.creator.id !== req.userData.userId) {
        const error = new HttpError('You are not allowed to delete this!', 401)
        return next(error);
    }

    
    try {
        // await place.remove();
        const sess = await mongoose.startSession();
        sess.startTransaction();
            await place.remove({session:sess});
            place.creator.places.pull(place);
            await place.creator.save({session:sess});
        await sess.commitTransaction();
    } catch(e) {
        const error = new HttpError('Something went wrong in the sess, could not delete place', 500);
        return next(error);
    }
    
    const imagePath = place.image;

    fs.unlink(imagePath, (err) => {
        console.log(err)
    })


    res.status(200).json({message: 'deleted'})
}







exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlaceById = updatePlaceById
exports.deletePlaceById = deletePlaceById