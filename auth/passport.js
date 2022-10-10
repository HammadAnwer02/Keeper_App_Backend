const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const User = require("../models/user");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

require("dotenv").config();

passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

// authorization
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET,
    },
    (payload, done) => {
      User.findById({ _id: payload.userId }, (err, user) => {
        if (err) return done(err, false);
        if (user) return done(null, user);
        else return done(null, false);
      });
    }
  )
);

// authentication using username and password
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    (email, password, done) => {
      // authenticate against the database
      User.findOne({ email: email }, (err, user) => {
        // something went wrong with the database
        if (err) return done(err);
        // if no user exists
        if (!user) {
          console.log("user not found");
          return done(null, false);
        }

        // check if password  is correct
        user.comparePassword(password, done);
      });
    }
  )
);

// for google authentication
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URL,
    },
    async (accessToken, refreshToken, profile, cb) => {
      const userObj = {
        googleId: profile.id,
        email: profile._json.email,
      };

      const user = await User.findOne({ googleId: profile.id });

      if (user) {
        return cb(null, user);
      }

      User.create(userObj)
        .then((user) => cb(null, user))
        .catch((err) => cb(err.message));
    }
  )
);


