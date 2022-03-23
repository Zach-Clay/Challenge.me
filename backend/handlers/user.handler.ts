import { NextFunction, Request, Response } from 'express';
import { ResponseBody } from '../model/interfaces';
import UserImpl, {
  UserLoginReqParams,
  UserRegisterBody,
  UserResetPasswordBody,
  UserUpdateBody,
} from '../model/user';
import * as service from '../services/user.service';
import { sign } from 'jsonwebtoken';

export async function register(
  req: Request<any, any, UserRegisterBody>,
  res: Response,
  next: NextFunction
) {
  let resBody: ResponseBody = { message: 'Register failed.' };

  try {
    let input = req.body;

    if (await service.checkUserExists(input.username)) {
      resBody.message = 'User already exists!';
      return res.status(400).json(resBody);
    }

    const user = await service.createUser(input);
    if (user) {
      resBody = {
        message: 'User created successfully.',
        data: { id: user.id },
      };

      return res.status(200).json(resBody);
    }

    return res.status(500).json(resBody);
  } catch (e) {
    next(e);
  }
}

export async function login(
  req: Request<any, any, any, UserLoginReqParams>,
  res: Response,
  next: NextFunction
) {
  let resBody: ResponseBody = { message: 'Login failed' };

  try {
    const input = req.query;

    if (!(await service.checkUserExists(input.username))) {
      resBody.message = 'User does not exist.';
      return res.status(401).json(resBody);
    }

    if (!(await service.checkPasswordMatch(input))) {
      resBody.message = 'Wrong password.';
      return res.status(401).json(resBody);
    }

    const token = sign(
      { username: input.username },
      <string>process.env.TOKEN_SECRET,
      { expiresIn: process.env.TOKEN_LIFE }
    );

    const refreshToken = sign(
      { username: input.username },
      <string>process.env.TOKEN_SECRET,
      { expiresIn: process.env.TOKEN_REFRESH_LIFE }
    );

    return res.status(200).json({ token: token, refreshToken: refreshToken });
  } catch (e) {
    next(e);
  }
}

export async function resetPassword(
  req: Request<any, any, UserResetPasswordBody>,
  res: Response,
  next: NextFunction
) {
  let resBody: ResponseBody = { message: 'Reset password failed.' };

  try {
    const input = req.body;

    if (
      !(await service.checkDobMatch(
        input.username,
        new Date(input.dateOfBirth)
      ))
    ) {
      resBody.message = 'Username and date of birth does not match.';
      return res.status(401).json(resBody);
    }

    const user = await service.updatePassword(
      input.username,
      input.newPassword
    );
    if (user) {
      resBody.message = 'Reset password successful.';
      return res.status(200).json(resBody);
    }

    return res.status(500).json(resBody);
  } catch (e) {
    next(e);
  }
}

export async function editProfile(
  req: Request<any, any, UserUpdateBody>,
  res: Response,
  next: NextFunction
) {
  let resBody: ResponseBody = { message: 'Update user failed.' };

  try {
    const input = req.body;

    if (await service.checkUsernameTaken(input.id, input.username)) {
      resBody.message = 'Username is taken.';
      return res.status(400).json(resBody);
    }

    const user = await service.updateUser(UserImpl.fromUserUpdateBody(input));
    if (user) {
      resBody.message = 'Edit profile successful.';
      resBody.data = user;
      return res.status(200).json(resBody);
    }

    return res.status(500).json(resBody);
  } catch (e) {
    next(e);
  }
}
