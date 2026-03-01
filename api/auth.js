import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { client, db } from '../database.js';

dotenv.config();

const authRouter = express.Router();

const usersCollection = db.collection('users');

const jwtSecret = process.env.JWT_SECRET

function generateJwt(user) {
    return jwt.sign({ id: user._id, username: user.username }, jwtSecret, { expiresIn: '7d' });
}

function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) return next();
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return next();
        req.user = {
            _id: user.id,
            username: user.username
        };
        return next();
    });
}


authRouter.post('/login', (req, res) => {
    const { username, password } = req.body;

    usersCollection.findOne({ username }).then(user => {
        if (!user) {
            res.status(400).json({ message: 'Invalid username or password' });
            return;
        }
        bcrypt.compare(password, user.password).then(isMatch => {
            if (!isMatch) {
                res.status(400).json({ message: 'Invalid username or password' });
                return;
            }
            const token = generateJwt(user);
            res.cookie('token', token, { httpOnly: true });
            res.status(200).json({ message: 'Login successful' });
        }).catch(err => {
            console.error('Error comparing passwords', err);
            res.status(500).json({ message: 'Internal server error' });
        });
    });
});

authRouter.post('/register', (req, res) => {
    const { username, password } = req.body;
    usersCollection.findOne({ username: username }).then(existingUser => {
        if (existingUser) {
            res.status(400).json({ message: 'Username already exists' });
            return;
        }
        bcrypt.hash(password, 10).then(hashedPassword => {
            const newUser = { username, password: hashedPassword };
            usersCollection.insertOne(newUser).then(result => {
                let user = { _id: result.insertedId.toString(), username };
                const token = generateJwt(user);
                res.cookie('token', token, { httpOnly: true });
                res.status(201).json({ message: 'User registered successfully' });
            }).catch(err => {
                console.error('Error inserting user', err);
                res.status(500).json({ message: 'Internal server error' });
            });
        }).catch(err => {
            console.error('Error hashing password', err);
            res.status(500).json({ message: 'Internal server error' });
        });
    }).catch(err => {
        console.error('Error checking existing user', err);
        res.status(500).json({ message: 'Internal server error' });
    });
});

authRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
});

authRouter.get('/me', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        usersCollection.findOne({ _id: new MongoClient.ObjectId(user._id) }).then(dbUser => {
            if (!dbUser) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.status(200).json(
                {
                    _id: dbUser._id,
                    username: dbUser.username
                }
            );
        }).catch(err => {
            console.error('Error fetching user', err);
            res.status(500).json({ message: 'Internal server error' });
        });
    });
});

export { authRouter, authenticateToken };
