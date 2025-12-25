import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./confing/conn.js"; 


dotenv.config();
// console.log("Mongo URI:", process.env.URI); 

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server & Database connected successfully 🚀")
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => 
    {
    console.log(`Server running on port ${PORT}`)
});

