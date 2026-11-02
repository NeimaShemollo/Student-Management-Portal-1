import jwt from "jsonwebtoken";

function generateAccessToken(id, role) {
    return jwt.sign(
        {
            id,
            role
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "15m"
        }
    );
}

export default generateAccessToken;