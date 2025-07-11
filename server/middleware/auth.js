const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Unauthorized Access: No token provided." });
        }

        const decoded = jwt.verify(token, process.env.MY_SECRET_KEY);

        req.user = decoded; 
        console.log("Authorized access!", decoded);
        
        next(); 

    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.status(401).json({ message: "Unauthorized Access: Invalid or expired token." });
    }
};
