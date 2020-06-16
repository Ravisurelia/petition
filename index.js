const express = require("express");
const app = express();

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

const { add, signed } = require("./data");

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(express.static(__dirname + "/public"));

app.listen(8080, () => {
  console.log("server listening!");
});
