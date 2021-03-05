const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();

admin.initializeApp();

const config = {
    apiKey: "AIzaSyC-JPUajveZ2X6MVd8A7KIqX4pu3JfWIBQ",
    authDomain: "socialape-cfaf3.firebaseapp.com",
    databaseURL: "https://socialape-cfaf3-default-rtdb.firebaseio.com",
    projectId: "socialape-cfaf3",
    storageBucket: "socialape-cfaf3.appspot.com",
    messagingSenderId: "591967973450",
    appId: "1:591967973450:web:b4eccc3657a4250b9576b3",
    measurementId: "G-X00625DBJ4"
};

const firebase = require('firebase')
firebase.initializeApp(config);

const db = admin.firestore();

app.get('/screams', (req, res) => {
    db
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
        let screams = [];
        data.forEach(doc => {
            screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt
            });
        })
        return res.json(screams);
    })
    .catch(err => console.error(err))
})

app.post('/scream', (req, res) => {

    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    db
        .collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({ message: `document ${doc.id} created succesfully`});
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong'});
            console.error(err);
        });
});

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) return true;
    else return false; 
} // helper method to check if email is valid

const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
} // helper method to check if handle is empty (removes possible white spaces first)

//signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    let errors = {}; // initialize error object

    if(isEmpty(newUser.email)) {
        errors.email = 'Must not be empty'
    } else if(!isEmail(newUser.email)){
        errors.email = 'Must be a valid email address'
    } // create errors for empty or invalid emails

    if(isEmpty(newUser.password)) {
        errors.password = 'Must not be empty'
    } // create error for empty password
    
    if(newUser.password !== newUser.confirmPassword){
        errors.confirmPassword = 'Passwords must match'
    } // create error for non matching passwords

    if(isEmpty(newUser.handle)) {
        errors.handle = 'Must not be empty'
    } // create error for empty handle

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    //TODO: validate data
    let token, userId;
    db.doc(`/users/${newUser.handle}`)
        .get()
        .then((doc) => {
        if(doc.exists){
            return res.status(400).json({ handle: 'this handle is already taken' });
        } else { 
            return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if(err.code === "auth/email-already-in-use"){
                return res.status(400).json({ email: 'Email is already in use'})
            } else {
                return res.status(500).json({ error: err.code });
            }
        })
}) // validates if user already exists. If new user, return a token, if user already exist throw an error

exports.api = functions.region('europe-west1').https.onRequest(app); // will automatically transform into multiple routes