const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
// Define a secret key (should be stored securely)
const secretKey = uuidv4();

function generateToken(id, role) {
    const payload = { id, role };
    const options = { expiresIn: '1h' }; // Token expiration time
    const token = jwt.sign(payload, secretKey, options);
    console.log(token);
    return token;
}

function verifyToken(token) {
    try {
        console.log(token);
        return jwt.verify(token, secretKey);
    } catch (err) {
        console.error(err.message);
        return null;
    }
}

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] || req.query.token;
    // console.log(token);
    let response = { message: 'Unauthorized'}
    if (token) {
        
        if (verifyToken(token)) {
            next(); 
        } else {
            res.status(401).send(response);
        }
    } else {
        res.status(401).send(response);
    }
};

module.exports = { generateToken, verifyToken, authenticateToken };