const functions = require("firebase-functions");
const app = require("express")();

const FBAuth = require('./util/fbAuth')

const {
    getAllScreams,
    postOneScream,
    getScream,
    commentOnScream,
    likeScream,
    unlikeScream,
    // likeScream,
} = require('./handlers/screams');

const { 
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser
} = require('./handlers/users');

const { db } = require('./util/admin');

// const firebase = require('firebase')
// firebase.initializeApp(config);

//scream routers
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);
// TODO: delete scream
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);

//signup route
app.post('/signup', signup ) // validates if user already exists. If new user, return a token, if user already exist throw an error
app.post('/login', login )
app.post('/user/image', FBAuth, uploadImage)
app.post('/user', FBAuth, addUserDetails)
app.get('/user', FBAuth, getAuthenticatedUser)

exports.api = functions.region('europe-west1').https.onRequest(app); // will automatically transform into multiple routes