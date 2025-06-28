import mongoose from "mongoose";

const breakTimeSchema = new mongoose.Schema({
  start: String,
  end: String,
});

export default breakTimeSchema;
