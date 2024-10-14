import { logger } from "../../shared/logger";
import { Context, IssueProps } from "../../interfaces/issue";
import HttpRequest from "../../utils/httpRequest";
import { IssueActions } from "../../interfaces/bpp_issue";

class BugzillaService {
  async createIssueInBugzilla(
    domain: string,
    issue: IssueProps,
    requestContext: Context,
    issue_Actions: IssueActions
  ) {
    try {
      const itemIds = issue?.order_details?.items.map(item => item.id).join(', ');

      const payload = {
        domain:domain,
        product: issue?.order_details?.items?.[0]?.product?.descriptor?.name,
        issue_desc: issue?.description?.short_desc,
        summary: issue?.description?.long_desc,
        alias: requestContext?.transaction_id || "",
        bpp_id: issue?.bppId,
        bpp_name: issue?.order_details?.items?.[0]?.product?.bpp_details?.name,
        attachments: issue?.description.images || [],
        action: issue_Actions,
        network_issue_id: issue?.issueId || "",
        issue_sub_category: issue?.sub_category || "",
        issue_sub_category_long_desc: issue?.description?.long_desc || "",
        network_order_id: issue?.order_details?.id || "",
        network_item_id: itemIds || ""
      };
      console.log("process.env.BUGZILLA_SERVICE_URI --- ", process.env.BUGZILLA_SERVICE_URI);
      console.log("payload ------------------ ", payload);

      const apiCall = new HttpRequest(
        process.env.BUGZILLA_SERVICE_URI,
        "/create",
        "POST",
        {
          ...payload,
        }
      );
      const result = await apiCall.send();
      if (result.status === 201) {
        logger.info("Created issue in Bugzilla");
        return result.data;
      }
    } catch (error: any) {
      logger.info("Error in creating issue in Bugzilla ", error?.message || error);
      console.log("Error in creating issue in Bugzilla ", error?.message || error);
      return error;
    }
  }

  async updateIssueInBugzilla(
    transaction_id: string,
    issue_actions: IssueActions,
    resolved: boolean = false
  ) {
    try {
      const apiCall = new HttpRequest(
        process.env.BUGZILLA_SERVICE_URI,
        `/updateBug/${transaction_id}`,
        "PUT",
        {
          status: resolved ? "RESOLVED" : "CONFIRMED",
          action: issue_actions,
        }
      );
      const result = await apiCall.send();
      if (result.status === 200) {
        logger.info("Issue updated in Bugzilla");
      }
    } catch (error) {
      logger.info("Error in updating issue in Bugzilla", error);
      return error;
    }
  }
}

export default BugzillaService;
