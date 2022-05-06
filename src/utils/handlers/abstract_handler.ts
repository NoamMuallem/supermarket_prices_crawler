import puppeteer from "puppeteer";
import { PromiseValue } from "type-fest";
import xml2js from "xml2js";

/**
 * Abstract Class Handler.
 *
 * @class Handler
 */
export default class Handler {
  protected browser: PromiseValue<ReturnType<typeof puppeteer.launch>>;

  constructor(browser: PromiseValue<ReturnType<typeof puppeteer.launch>>) {
    this.browser = browser;
  }

  async getAllStores(
    // @ts-ignore
    cb: Function | undefined
  ): Promise<{ [key: string]: any } | null> {
    throw new Error("Method 'say()' must be implemented.");
  }

  async getAllProductsInAllStores(
    // @ts-ignore
    chainJsonCb: Function | undefined,
    // @ts-ignore
    singleStoreJsonCb: Function | undefined,
    // @ts-ignore
    chainName: string | undefined
  ) {
    throw new Error("Method 'say()' must be implemented.");
  }

  async getFullPrises(): Promise<string> {
    throw new Error("Method 'getFullPrises()' must be implemented.");
  }

  protected parseXML(xml: string): Promise<{ [key: string]: any }> {
    return new Promise((resolve, reject) => {
      xml2js.parseString(
        xml,
        { mergeAttrs: true, trim: true, explicitArray: true },
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        }
      );
    });
  }
}
