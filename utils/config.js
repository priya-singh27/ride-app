const secretKey = process.env.SECRET_KEY;

module.exports = function () {
    
    if (!secretKey) {
        console.log('FATAL ERROR:jwtPrivateKey is not defined.');
        process.exit(1);
    }
    
}