const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const Post =  require('./models/post');
const mongoose = require('mongoose');
const postsRouters = require('./routes/posts');
const userRouters = require('./routes/user');
const path = require("path");

mongoose.connect(`mongodb+srv://mean:${process.env.MONGO_ATLAS_PW}@mean-stack.yuktkry.mongodb.net/mean-stack?retryWrites=true&w=majority`).then(() => {
    console.log("Connected to Database!");
}).catch(() => {
    console.log("Connection failed!");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,PUT,DELETE,OPTIONS');
    next();
})

app.use('/api/posts', postsRouters);
app.use('/api/user', userRouters);
app.use("/images", express.static(path.join("backend/images")));

module.exports = app;

// lVzpo2pRxNgMoIfh