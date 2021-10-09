"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notFound = (err, req, res, next) => {
    if (err.status === 404) {
        res.status(404).send(err.m);
    }
    else {
        next(err);
    }
};
const badRequest = (err, req, res, next) => {
    if (err.status === 400) {
        res.status(400).send(err.m);
    }
    else {
        next(err);
    }
};
const notAuthorized = (err, req, res, next) => {
    if (err.status === 401) {
        res.status(401).send(err.m);
    }
    else {
        next(err);
    }
};
const forbidden = (err, req, res, next) => {
    if (err.status === 403) {
        res.status(403).send(err.m);
    }
    else {
        next(err);
    }
};
const toManyRequests = (err, req, res, next) => {
    if (err.status === 429) {
        res.status(429).send({ leftUntilNextRefresh: err.m });
    }
    else {
        next(err);
    }
};
const catchAll = (err, req, res, next) => {
    if (err) {
        res.status(500).send('Generic Server Error');
        console.log(err);
    }
    next();
};
exports.default = [notFound, badRequest, notAuthorized, forbidden, toManyRequests, catchAll];
