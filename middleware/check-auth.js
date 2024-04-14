// const jwt = require('jsonwebtoken');
// //this jsonwebtoken pckg is used to;
// //1- generate the token
// //2- verify the token
// const HttpError = require('../models/http-error');

const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req,res,next) => {
    if(req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        //Authorization: 'Bearer TOKEN'
        if(!token) {
            throw new Error('Authentication failed!')
        }
        const decodedToken = jwt.verify(token, 'secretKey');
        //next we'll add a userData property to the req object
        req.userData = {userId: decodedToken.userId};
        next();
    } catch(err) {
        const error = new HttpError('Authentication failed!', 401);
        return next(error);
    }
}





// const jwt = require('jsonwebtoken');

// const authenticateToken = (req, res, next) => {
//   const token = req.header('Authorization');
//   if (!token) return res.status(401).send('Access Denied');

//   jwt.verify(token, 'secretKey', (err, user) => {
//     if (err) return res.status(403).send('Invalid Token');

//     req.user = user;
//     next();
//   });
// };

// module.exports = authenticateToken;
