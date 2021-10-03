import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';

type ErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => void;

const notFound: ErrorHandler = (err, req, res, next) => {
  if (err.status === 404) {
    res.sendStatus(404).send(err.m);
  } else {
    next(err);
  }
};
const badRequest: ErrorHandler = (err, req, res, next) => {
  if (err.status === 400) {
    res.sendStatus(400).send(err.m);
  } else {
    next(err);
  }
};

const notAuthorized: ErrorHandler = (err, req, res, next) => {
  if (err.status === 401) {
    res.sendStatus(401).send(err.m);
  } else {
    next(err);
  }
};
const forbidden: ErrorHandler = (err, req, res, next) => {
  if (err.status === 403) {
    res.sendStatus(403).send(err.m);
  } else {
    next(err);
  }
};
const toManyRequests: ErrorHandler = (err, req, res, next) => {
  if (err.status === 429) {
    console.log(err.m);
    res.sendStatus(429).send(err.m);
  } else {
    next(err);
  }
};

const catchAll: ErrorHandler = (err, req, res, next) => {
  if (err) {
    res.sendStatus(500).send('Generic Server Error');
    console.log(err);
  }
  next();
};

export default [notFound, badRequest, notAuthorized, forbidden, toManyRequests, catchAll];
