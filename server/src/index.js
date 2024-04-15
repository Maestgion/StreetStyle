import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";


dotenv.config()


connectDB()
.then(()=>{

    app.on('error', (error)=>{
        console.log(`Express App Error: `, error.message )
    })

    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on Port: ${process.env.PORT}`)
    })
    
}

)
.catch((error)=>{
    console.log(`Error while connecting to MongoDB: `, error.message)
})