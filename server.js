const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Set up routes
app.use("/api/image", require("./routes/image"))

if (process.env.NODE_ENV === 'production') {
  // production mode
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}






mongoose
  .connect(process.env.MONGODB_URL, (err) => {
    if (err) {
      console.log("Err of connect DB:", err.message)
      return;
    } else {
      console.log("DB connected !")

    }
  })

app.listen(port, () => {
  console.log(`server connected at port ${port}`)
})