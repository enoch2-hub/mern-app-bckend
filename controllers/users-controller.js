const { v4: uuidv4 } = require("uuid");
const HttpError = require("../models/http-error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

let dummyUsers = [
  {
    name: "flip",
    email: "flip@gmail.com",
    password: "fliP",
  },
];

const getUsers = async (req, res, next) => {
  // res.json({users: dummyUsers})
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (e) {
    const error = new HttpError(
      "Fetching Users failed, please try again later",
      500
    );
    return next(error);
  }
  res.json({ users: users.map((u) => u.toObject({ getters: true })) });
};

// const signup-old = async (req,res,next) => {
//     const {name, email, password, image, places} = req.body;

//     const userExists = dummyUsers.find(u => u.email === email)
//     if(userExists) {
//         throw new HttpError('Could not create user, user with email already exists', 422);
//     }

//     const createdUser = {
//         id:uuidv4(),
//         name,
//         email,
//         password
//     };

//     dummyUsers.push(createdUser);
//     res.status(200).json({newUser: createdUser})
// };








//=================================Register================================



const signup = async (req, res, next) => {
  const { name, email, password, image } = req.body;

  let existingUser;
  try {
    existingUser = await User.find({ email: email });
  } catch {
    const error = new HttpError(
      "Signing up failed, please try again later",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("email already exists", 500);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12)
  } catch (err) {
    const error = new HttpError("Couln't create user, please try again", 500);
    return next(error)
  }

  const createdUser = new User({
    name,
    email,
    image:
      "https://img.freepik.com/free-photo/animal-instinbct-natural-survive-wildlife_53876-14215.jpg?w=1380&t=st=1704388860~exp=1704389460~hmac=057d342b06cd3d8c6f8c34a88e420141f7cc26754cce1e9b1b5bbfd56a69221c",
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (e) {
    console.log(e);
    const error = new HttpError("Signing up failed, please try again", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "secretKey",
      { expiresIn: "1h" }
    );
  } catch (e) {
    const error = new HttpError("Signing up failed", 500);
    return next(error);
  }

  // res.status(200).json({user: createdUser.toObject({getters:true})})
  //---getters:true removes the underscore in front of-
  //-the id poperty to make it easier to access later ID---

  res
    .status(200)
    .json({ 
      userId: createdUser.id, 
      email: createdUser.email, 
      token 
    });
};








//==================================Login======================================


const login = async (req, res, next) => {
  const { email, password } = req.body;

  // const identifiedUser = dummyUsers.find(u => u.email === email)

  // if (!identifiedUser || identifiedUser.password !== password) {
  //     throw new HttpError('Could not find user, credentials seem to be wrong', 401)
  // }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (e) {
    const error = new HttpError("Failed to login, please try again later", 500);
    return next(error);
  }

  // if(!existingUser || existingUser.password !== password){
  //     const error = new HttpError('Invalid Username or Password!', 401);
  //     return next(error)
  // }

  if (!existingUser) {
    const error = new HttpError("Invalid Username and Password!", 401);
    return error;
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch(err) {
    const error = new HttpError("Couldn't log you in, please check back later", 500)
    return next(error)
  }

  if(!isValidPassword) {
      const error = new HttpError("Invalid Username or Password!", 401)
      return next(error)
  }

  let token;
  try {
    token = jwt.sign(
      {userId: existingUser.id, email: existingUser.email},
      "secretKey",
      {expiresIn: "1h"}
    )
  } catch(err) {
    const error = new HttpError('Logging in failed', 500);
    return next(error);
  }

  // res.status(200).json({message: 'logged in successfully!'})
  // res.status(200).json({user: existingUser.toObject({getters:true})})

  res.status(200).json({
    userId: existingUser.id,
    email: existingUser.email,
    token:token
  })

};









exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
