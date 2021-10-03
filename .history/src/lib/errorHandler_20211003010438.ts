import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';

type ErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => void;

const notFound: ErrorHandler = (err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send(err.m);
  } else {
    next(err);
  }
};
const badRequest: ErrorHandler = (err, req, res, next) => {
  if (err.status === 400) {
    res.status(400).send(err.m);
  } else {
    next(err);
  }
};

const notAuthorized: ErrorHandler = (err, req, res, next) => {
  if (err.status === 401) {
    res.status(401).send(err.m);
  } else {
    next(err);
  }
};
const forbidden: ErrorHandler = (err, req, res, next) => {
  if (err.status === 403) {
    res.status(403).send(err.m);
  } else {
    next(err);
  }
};
const toManyRequests: ErrorHandler = (err, req, res, next) => {
  if (err.status === 429) {
    console.log(err.m);
    res.status(429).send({leftUntilNextRefresh: err.m});
  } else {
    next(err);
  }
};

const catchAll: ErrorHandler = (err, req, res, next) => {
  if (err) {
    res.status(500).send('Generic Server Error');
    console.log(err);
  }
  next();
};

export default [notFound, badRequest, notAuthorized, forbidden, toManyRequests, catchAll];
