import { Router } from "express";
import * as PetController from "@/controllers/petController";
import { parseMultipart } from "@lapeh/middleware/multipart";

const router = Router();

router.get("/", PetController.index);
router.get("/:id", PetController.show);
router.post("/", parseMultipart, PetController.store);
router.put("/:id", parseMultipart, PetController.update);
router.delete("/:id", PetController.destroy);

export default router;
