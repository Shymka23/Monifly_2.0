import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validation.middleware";
import { CryptoController } from "../controllers/crypto.controller";
import {
  buyCryptoSchema,
  sellCryptoSchema,
  updateCryptoSchema,
  pricesQuerySchema,
  topCryptosQuerySchema,
} from "../validators/crypto.validator";
import { idParamSchema } from "../validators/wallet.validator";

const router = Router();

router.use(authenticate);

// Get portfolio stats
router.get("/stats", CryptoController.getStats);

// Get top cryptos by market cap
router.get(
  "/top",
  validateQuery(topCryptosQuerySchema),
  CryptoController.getTopCryptos
);

// Get current prices
router.get(
  "/prices",
  validateQuery(pricesQuerySchema),
  CryptoController.getPrices
);

// Get all holdings
router.get("/", CryptoController.getAll);

// Get single holding
router.get("/:id", validateParams(idParamSchema), CryptoController.getOne);

// Buy crypto
router.post("/buy", validate(buyCryptoSchema), CryptoController.buy);

// Sell crypto
router.post(
  "/:id/sell",
  validateParams(idParamSchema),
  validate(sellCryptoSchema),
  CryptoController.sell
);

// Update holding
router.put(
  "/:id",
  validateParams(idParamSchema),
  validate(updateCryptoSchema),
  CryptoController.update
);

// Delete holding
router.delete("/:id", validateParams(idParamSchema), CryptoController.delete);

export default router;
