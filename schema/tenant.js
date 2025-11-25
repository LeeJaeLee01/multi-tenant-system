import { Schema, Types } from "mongoose";

const tenantSchema = new Schema({
  _id: {
    type: Schema.Types.Mixed,
    default: () => new Types.ObjectId(),
  },
  dbUri: { type: String, required: true },
  name: { type: String, unique: true, required: true },
});

export default tenantSchema;