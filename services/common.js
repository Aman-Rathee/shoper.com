
const passport = require('passport')

exports.isAuth = (req, res, next) => {
    return passport.authenticate('jwt');
}

exports.sanitizeUser = (user) =>{
    return {id:user.id, role:user.role}
}

exports.cookieExtractor = function(req){
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
    // TODO : this is temporary token for testing without cookies
    // token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MmU0MTdjOGJjMDY2ZWYxNjNlZDQ1MiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjk3NTMwNDUxfQ.gq6LvtWIO22rkOVjq7_OXAXLgkwOmN6FGx_DRJFofag';
    // token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MjJkYmQzMjkwMWI3MGMyMDA5MDE2NSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5ODE0NTcwOH0.ipsZ89jc3kB5ZDT-2mgVjE7JWQ-SJpCEYKxPIwWGiPc';
    return token;
}