const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require('./util/fbAuth')

const { db } = require('./util/admin');

const {
    getAllScreams,
    postOneScream,
    getScream,
    commentOnScream,
    likeScream,
    unlikeScream,
    deleteScream,
} = require('./handlers/screams');

const { 
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser
} = require('./handlers/users');

// const firebase = require('firebase')
// firebase.initializeApp(config);

//scream routers
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);
// TODO: delete scream
app.delete('/scream/:screamId', FBAuth, deleteScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);

//signup route
app.post('/signup', signup ) // validates if user already exists. If new user, return a token, if user already exist throw an error
app.post('/login', login )
app.post('/user/image', FBAuth, uploadImage)
app.post('/user', FBAuth, addUserDetails)
app.get('/user', FBAuth, getAuthenticatedUser)

exports.api = functions.region('europe-west1').https.onRequest(app); // will automatically transform into multiple routes

// create a notification on liking a scream

exports.createNotificationOnLike = functions
    .region('europe-west1')
    .firestore.document('likes/{id}')
    .onCreate((snapshot) => {
        return db
        .doc(`/screams/${snapshot.data().screamId}`)
        .get()
        .then((doc) => {
            if (
            doc.exists &&
            doc.data().userHandle !== snapshot.data().userHandle
            ) {
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt: new Date().toISOString(),
                recipient: doc.data().userHandle,
                sender: snapshot.data().userHandle,
                type: 'like',
                read: false,
                screamId: doc.id
            });
            }
        })
        .catch((err) => console.error(err));
    });

exports.deleteNotificationOnUnLike = functions
    .region('europe-west1')
    .firestore.document('likes/{id}')
    .onDelete((snapshot) => {
        return db
        .doc(`/notifications/${snapshot.id}`)
        .delete()
        .catch((err) => {
            console.error(err);
            return;
        });
    });

exports.createNotificationOnComment = functions
    .region('europe-west1')
    .firestore.document('comments/{id}')
    .onCreate((snapshot) => {
        return db
        .doc(`/screams/${snapshot.data().screamId}`)
        .get()
        .then((doc) => {
            if (
            doc.exists &&
            doc.data().userHandle !== snapshot.data().userHandle
            ) {
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt: new Date().toISOString(),
                recipient: doc.data().userHandle,
                sender: snapshot.data().userHandle,
                type: 'comment',
                read: false,
                screamId: doc.id
            });
            }
        })
        .catch((err) => {
            console.error(err);
            return;
        });
    });