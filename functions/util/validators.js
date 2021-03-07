const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) return true;
    else return false; 
} // helper method to check if email is valid

const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
} // helper method to check if handle is empty (removes possible white spaces first)

exports.validateSignupData = (data) => {
    let errors = {}; // initialize error object

    if(isEmpty(data.email)) {
        errors.email = 'Must not be empty'
    } else if(!isEmail(data.email)){
        errors.email = 'Must be a valid email address'
    } // create errors for empty or invalid emails
    
    if(isEmpty(data.password)) {
        errors.password = 'Must not be empty'
    } // create error for empty password
    
    if(data.password !== data.confirmPassword){
        errors.confirmPassword = 'Passwords must match'
    } // create error for non matching passwords
    
    if(isEmpty(data.handle)) {
        errors.handle = 'Must not be empty'
    } // create error for empty handle
    
    return { 
        errors,
        valid: Object.keys(errors).length === 0 ? true : false 
    } 
} 

exports.validataLoginData = (data) => {
    let errors = {};

    if(isEmpty(data.email)) errors.email = 'Must not be empty';

    if(isEmpty(data.password)) errors.password = 'Must not be empty';

    return { 
        errors,
        valid: Object.keys(errors).length === 0 ? true : false 
    } 

    // validate if the email and password contain data
}
