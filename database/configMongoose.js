const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    const urlMongo = process.env.MONGODB_URL;
    await mongoose.connect(urlMongo, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    console.log("Base de datos Online");
  } catch (error) {
    console.log(error);
    throw new Error("Error al conectar a la base de datos");
  }
};

module.exports = { dbConnection };