/* eslint-disable import/prefer-default-export */
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export const verifyJWT = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (authorization) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized Access from Server!!',
            });
        }
        const token = authorization.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decode) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized Access',
                });
            }
            req.user = decode;
            next();
        });
    } catch (error) {
        console.log(error);
    }
};
