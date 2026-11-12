import {Router} from "express";
import { createCheckout } from "../controllers/checkoutController";
const router = Router();

router.use("/", createCheckout);

export default router;