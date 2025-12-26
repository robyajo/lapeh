import { Router } from "express";
import * as PetController from "../controllers/petController";

const router = Router();

router.get("/", PetController.index);
router.get("/:id", PetController.show);
router.post("/", PetController.store);
router.put("/:id", PetController.update);
router.delete("/:id", PetController.destroy);

export default router;
