const uuid = require('uuid');

const HttpError = require('../models/http-error')

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
        title: 'Empire state building',
        description: 'one of the most famous sky scrappers in the world',
        location: {
            lat: 40.908423,
            lng: -73.987543
        },  
        address: '30 B w wall street',
        creator: 'u2'
    }
];



const getPlaceById = (req,res,next) => {
    const placeId = req.params.pid;
    const place = dummyPlaces.find((p) => {
        return p.id === placeId;
    });
    if (!place) {
        // return res.status(404).json({message:'Could not find requested place'})
        // const error = new Error('Could not find a place for the provided id')
        // error.code = 404
        // throw error;
        throw new HttpError('Could not find a place for the provided id', 404)
    }
    res.json({place})
}


// function getPlaceById() {...}
// const getPlaceById = function() {...}


const getPlaceByUserId = (req,res,next) => {
    const userId = req.params.uid;
    const place = dummyPlaces.find((u) => {
        return u.creator === userId;
    })
    // place? res.json({place}) : res.send('not found')
    if(!place) {
        // const error = new Error('Could not find place for the provided user id')
        // error.code = 404
        // return next(error);
        return next(
            new HttpError('Could not find place for the provided user id', 404)
        )
    }
    res.json({place})
}


const createPlace = (req,res,next) => {
    const {title, description, coordinates, address, creator} = req.body;
    
    const createdPlace= {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        creator

    };

    dummyPlaces.push(createdPlace)

    // res.status(201).json({createdPlace});
    res.status(201).json({ place: createdPlace });

};


exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId
exports.createPlace = createPlace