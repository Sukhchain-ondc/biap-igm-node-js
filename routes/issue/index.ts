import express from "express";
import { authentication } from "../../middleware";
import IssueController from "../../controller/issue/issue.controller";

const router = express.Router();

const issueController = new IssueController();
router.post("/v1/issue", authentication(), issueController.createIssue);
router.get("/v1/issue", authentication(), issueController.getIssue);
router.get("/v1/on_issue", authentication(), issueController.onIssue);
router.get("/v1/getIssues", authentication(), issueController.getIssuesList);

export default router;
