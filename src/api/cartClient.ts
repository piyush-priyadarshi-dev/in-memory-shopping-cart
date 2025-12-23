import dotenv from "dotenv";
import { SalesforceCartClient } from "../domain/SalesforceCartClient";

dotenv.config();

const expiryMsEnv = Number(process.env.CART_EXPIRY_MS);
const cartExpiryMs = Number.isFinite(expiryMsEnv)
  ? expiryMsEnv
  : 15 * 60 * 1000;

export const cartClient = new SalesforceCartClient(cartExpiryMs);
export default cartClient;
