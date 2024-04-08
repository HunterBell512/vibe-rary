const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to login!');
    }
  },

  Mutation: {
    addUser: async (parent, args) => {
      const newUser = await User.create(args);
      const token = signToken(newUser);

      return { newUser, token };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if(!user){
        throw new AuthenticationError('You need to be logged in.');
      }
      const correctPw = await user.isCorrectPassword(password);
      if(!correctPw) {
        throw new AuthenticationError('You need to be logged in.');
      }
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in.');
      };
      const userData = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: input } },
        { new: true, runValidators: true }
      );
      return userData;
    },
    removeBook: async (parent, { bookId }, context) => {
      if (!context.user) {
        console.error('Invalid email or password.')  
        return;
      }
      const userData = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }  
      );
      return userData;
    }
  }
};

module.exports = resolvers;


