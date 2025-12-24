import { Router } from "express";
import { createCart } from "../controllers/createCartController";
import { getCart } from "../controllers/getCartController";
import { addItem } from "../controllers/addItemController";
import { updateItemQuantity } from "../controllers/updateItemQuantityController";
import { removeItem } from "../controllers/removeItemController";

const router = Router();

router.post("/", createCart);
router.get("/:cartId", getCart);
router.post("/:cartId/items", addItem);
router.put("/:cartId/items/:itemId", updateItemQuantity);
router.delete("/:cartId/items/:itemId", removeItem);

export default router;
