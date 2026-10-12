import express from "express";

const nayme:string = "John";

console.log(nayme);

const app = express();

app.listen(3001, ()=>{console.log("listening on port 3001 ...")});