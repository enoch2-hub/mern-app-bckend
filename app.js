const express = require('express');
const app = express();
const bodyparser = require('body-parser');

const placesRoutes = require('./routes/places-routes');

app.use('/api/places', placesRoutes);

app.use((error, req, res, next) => {
    if(res.headerSent) {
       return next(error) 
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occured!'})
})

const port = 5000;
app.listen(port, () => console.log(`on port ${port}`))
