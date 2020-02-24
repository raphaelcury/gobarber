export default {
  url: process.env.MONGO_URL,
  options: {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  },
};
