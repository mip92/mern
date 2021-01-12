const express = require('express');
const config = require("config");
const mongoose = require("mongoose")


const app = express();
app.use(express.json({extended: true}))
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/link', require('./routes/linkRoutes'))


const PORT =config.get('port')||5000;
const MONGOURI =config.get('mongoUri')

async  function start(){
    try{
        await mongoose.connect(MONGOURI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        })
        app.listen(PORT, () => {
            console.log(`App has been started on port ${PORT}...`)
        })
    }catch (e){
        console.log(`Server Error`,e.message)
        process.emit(1)
    }
}

start()

