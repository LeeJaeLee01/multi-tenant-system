import { Schema, Types } from "mongoose";

const tenantUserSchema = new Schema({
  _id: {
    type: Schema.Types.Mixed,
    default: () => new Types.ObjectId(),
  },
  email: String,
  tenantId: {
    type: Schema.Types.Mixed,
    ref: "tenants",
  },
});

export default tenantUserSchema;