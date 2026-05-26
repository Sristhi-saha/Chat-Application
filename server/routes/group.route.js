// routes/group.route.js
import express from "express";
import { getGroupMessage, getGroups } from "../controllers/message.controller.js";
import { authMiddelware } from "../middlewares/auth.middelware.js";

const router = express.Router();

router.get("/getGroups", authMiddelware, getGroups);
router.get("/getGroupMessages/:groupId",authMiddelware,getGroupMessage);

export default router;