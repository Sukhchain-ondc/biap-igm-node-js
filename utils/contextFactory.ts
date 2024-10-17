import { v4 as uuidv4 } from "uuid";
import { PROTOCOL_CONTEXT, PROTOCOL_VERSION } from "../shared/constants";
import { CITY_CODE } from "../shared/cityCode";

class ContextFactory {
  domain: string;
  country: string;
  bapId: string;
  bapUrl: string;
  timestamp: Date;
  constructor(arg?: any) {
    let {
      domain,
      //TODO: map city to city code. eg. Haydrabad
      country = process.env.COUNTRY,
      bapId = process.env.BAP_ID,
      bapUrl = process.env.BAP_URL,
    } = arg || {};

    this.domain = domain;
    this.country = country;
    this.bapId = bapId;
    this.bapUrl = bapUrl;
    this.timestamp = new Date();
  }

  getCity(city: string, state: string, cityCode: string) {
    //map state and city to city code

    if (cityCode) {
      return cityCode;
    } else {
      cityCode = process.env.CITY || "std:080";
      let cityMapping = CITY_CODE.find((x: any) => {
        if (x.City === city && x.State === state) {
          return x;
        }
      });

      if (cityMapping) {
        if (cityMapping.Code) {
          cityCode = cityMapping.Code;
        }
      }
      return cityCode;
    }
  }

  create(contextObject?: any) {
    const {
      domain,
      transactionId, //FIXME: if ! found in args then create new
      messageId = uuidv4(),
      action = PROTOCOL_CONTEXT.ISSUE,
      bppId,
      city,
      state,
      cityCode,
      bpp_uri,
    } = contextObject || {};

    return {
      domain: domain,
      country: this.country,
      city: this.getCity(city, state, cityCode),
      action: action,
      core_version: PROTOCOL_VERSION.v_1_0_0,
      bap_id: this.bapId,
      bap_uri: this.bapUrl,
      bpp_uri: bpp_uri,
      transaction_id: transactionId || uuidv4(),
      message_id: messageId,
      timestamp: this.timestamp,
      ...(bppId && { bpp_id: bppId }),
      ttl: "PT30S",
    };
  }
}

export default ContextFactory;
