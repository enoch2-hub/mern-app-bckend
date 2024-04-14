const express = require('express');
const router = express.Router();
const {check} = require('express-validator')

const placesControllers = require('../controllers/places-controller')
const checkAuth = require('../middleware/check-auth')

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);


router.use(checkAuth)
// router.post('/', placesControllers.createPlace);
router.post('/', 
    [
        check('title').not().isEmpty(),
        check('description').isLength({min:5}),
        check('address').not().isEmpty()
    ]
, placesControllers.createPlace);


router.patch('/:pid', [
    check('title').not().isEmpty(),
    check('description').isLength({min:5})
], placesControllers.updatePlaceById);


router.delete('/:pid', placesControllers.deletePlaceById);

module.exports = router;



























