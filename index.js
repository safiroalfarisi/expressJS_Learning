const express = require('express');
const mongoose = require('mongoose');   
const Product = require('./models/product.model');
const productRoute = require('./routes/product.route');
const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//routes
app.use("/api/products", productRoute);

app.get('/', (req, res) => {
    res.send('Hello, i am Saint Shiro');
});


mongoose.connect("mongodb+srv://shiro:1234@expressjs.b6i7k0q.mongodb.net/express_learn?appName=expressjs")
.then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
})
.catch(() => {
    console.log("Connection failed");
})