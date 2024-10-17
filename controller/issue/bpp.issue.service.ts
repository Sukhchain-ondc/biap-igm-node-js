import { protocolIssue } from "../../utils/protocolApis";
import { PROTOCOL_CONTEXT } from "../../shared/constants";
import {
  Fulfillment,
  IssueProps,
  Item,
  Response,
} from "../../interfaces/issue";
import { Context, IssueRequest } from "../../interfaces/bpp_issue";
class BppIssueService {
  /**
   * bpp issue
   * @param {Object} context
   * @param {Object} issue
   */
  async issue(context: Context, issue: IssueProps) {
    try {
      const { issue_actions, order_details, description } = issue;

      const issueRequest: IssueRequest = {
        context: context,
        message: {
          issue: {
            id: issue?.issueId,
            category: issue?.category,
            sub_category: issue?.sub_category,
            complainant_info: issue?.complainant_info,
            order_details: {
              id: order_details?.id,
              state: order_details?.state,
              items:
                order_details?.items.map((item: Item) => {
                  return {
                    id: item?.id?.toString(),
                    quantity: item?.quantity?.count,
                  };
                }) || [],
              fulfillments: order_details?.fulfillments.map(
                (item: Fulfillment) => {
                  return {
                    id: item?.id?.toString(),
                    state: item?.state?.descriptor?.code,
                  };
                }
              ),
              provider_id: order_details?.provider_id,
            },
            description: {
              short_desc: description?.short_desc,
              long_desc: description?.long_desc,
              additional_desc: description?.additional_desc,
              images: description?.images,
            },
            source: {
              network_participant_id: process.env.BAP_ID,
              type: "CONSUMER",
            },
            expected_response_time: {
              duration: process.env.EXPECTED_RESPONSE_TIME || "PT1H",
            },
            expected_resolution_time: {
              duration: process.env.EXPECTED_RESOLUTION_TIME || "P1D",
            },
            status: issue?.status || "OPEN",
            issue_type: PROTOCOL_CONTEXT?.ISSUE.toUpperCase(),
            issue_actions: issue_actions,
            created_at: issue?.created_at,
            updated_at: new Date(),
          },
        },
      };

      const response: Response = await protocolIssue(issueRequest);
      return { context: context, message: response.message };
    } catch (err) {
      throw err;
    }
  }
  async closeOrEscalateIssue(context: Context, issue: IssueProps) {
    try {
      const { issue_actions } = issue;

      const issueRequest: any = {
        context: context,
        message: {
          issue: {
            id: issue?.id,
            status: issue?.status,
            issue_actions: issue_actions,
            rating: issue?.rating,
            created_at: issue?.created_at,
            updated_at: issue?.updated_at,
            issue_type: PROTOCOL_CONTEXT?.ISSUE.toUpperCase(),
          },
        },
      };

      const response: any = await protocolIssue(issueRequest);
      return { context: context, message: response?.message };
    } catch (err) {
      throw err;
    }
  }
}

export default BppIssueService;
