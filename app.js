if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const fs = require('fs');// fs stands for file system, a nodejs core module.
//allows to interact with the files in the file system

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const port = process.env.PORT || 5000;



const corsOptions = {
    // origin: 'https://yourgallery.onrender.com',
    origin: 'http://localhost:3000', 
    credentials: true,
  };
app.use(cors(corsOptions));


app.use(bodyparser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));
app.use(express.static(path.join('public')))

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
})

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req,res,next)=> {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req,res,next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
})

app.use((error, req, res, next) => {
    if(req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err)
        })
    }
    if(res.headerSent) {
       return next(error)
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occured!'})
})

// app.listen(port, () => console.log(`on port ${port}`))
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose
    .connect(
        // 'mongodb+srv://enochpereracoding2:SHKPXV8TGCczBcfq@cluster0.tirextk.mongodb.net/mern?retryWrites=true&w=majority'
        process.env.dbUrl,
        )
    .then(() => {
        console.log('Mongodb Connected!(via mongoose)')
        // app.listen(port, () => console.log(`on port ${port}`))
    })
    .catch((err) => {
        console.log('*-*-*-*-*-*-*-*-*-*-*-*-*-*');
        console.log('*-*-*-*-*-*-*-*-*-*-*-*-*-*');
        console.log('*-*-*-*-*-*-*-*-*-*-*-*-*-*');

        console.log(err)
    })


app.listen(port, () => {
    console.log(`on port ${port}`)
})


