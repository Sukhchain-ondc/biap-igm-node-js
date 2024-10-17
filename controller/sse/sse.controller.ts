import { addSSEConnection } from "../../utils/sse";
import { Response, Request, NextFunction } from "express";
import SseProtocol from "./sseProtocol.service";
import ConfigureSse from "./configureSse.service";
import IssueStatusService from "../../controller/issue_status/issue_status.service";
import { logger } from "../../shared/logger";

const sseProtocolService = new SseProtocol();
const issueStatusService = new IssueStatusService();
class SseController {
  /**
   * on event
   * @param {*} req HTTP request object
   * @param {*} res HTTP response object
   * @param {*} _next Callback argument to the middleware function
   */
  async onEvent(req: Request, res: Response, _next: NextFunction) {
    try {
      const { query = {} } = req;
      const { messageId }: any = query;

      if (messageId && messageId.length) {
        const configureSse = new ConfigureSse(req, res, messageId);
        const initSSE = configureSse.initialize();
        addSSEConnection(messageId, initSSE);
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * on issue
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   */
  onIssue(req: Request, res: Response, next: NextFunction) {
    const { body: response } = req;

    sseProtocolService
      .onIssue(response)
      .then((result: any) => {
        res.json(result);
      })
      .catch((err: any) => {
        next(err);
      });
  }

  /**
   * on issue_status
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   */
  onStatus(req: Request, res: Response, next: NextFunction) {
    const { body: response } = req;
    const { messageId } = response;
console.log("Response before issueStatusService being hit",response)

    issueStatusService
      .onIssueStatus(messageId)
      .then(() => {
        logger.info("Updated Issue in Unsolicited Calls");
      })
      .catch((err) => {
        console.log("Error in Unsolicited calls", JSON.stringify(err));
      });

    sseProtocolService
      .onIssueStatus(response)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
	console.log("Before going next:",err)
        next(err);
      });
  }
}

export default SseController;
