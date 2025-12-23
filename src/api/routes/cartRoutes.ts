import { Router } from "express";
import { createCart } from "../controllers/createCartController";
import { getCart } from "../controllers/getCartController";
import { addItem } from "../controllers/addItemController";
import { updateItemQuantity } from "../controllers/updateItemQuantityController";
import { removeItem } from "../controllers/removeItemController";
import { validateBody } from "../middleware/validateRequest";
import {
  addItemSchema,
  createCartSchema,
  updateItemSchema,
} from "../schemas/cartSchemas";

const router = Router();

router.post("/", validateBody(createCartSchema), createCart);
router.get("/:cartId", getCart);
router.post("/:cartId/items", validateBody(addItemSchema), addItem);
router.put(
  "/:cartId/items/:itemId",
  validateBody(updateItemSchema),
  updateItemQuantity
);
router.delete("/:cartId/items/:itemId", removeItem);

export default router;
