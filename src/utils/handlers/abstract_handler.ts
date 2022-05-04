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

  async getAllStores(): Promise<string> {
    throw new Error("Method 'say()' must be implemented.");
  }

  async getFullPrises(): Promise<string> {
    throw new Error("Method 'getFullPrises()' must be implemented.");
  }

  protected parseXML(xml: string): Promise<string> {
    return new Promise((resolve, reject) => {
      xml2js.parseString(
        xml,
        { mergeAttrs: true, trim: true, explicitArray: true },
        (err, result) => {
          if (err) {
            reject(err);
          }
          // `result` is a JavaScript object
          // convert it to a JSON string
          const json = JSON.stringify(result, null, 0);
          // log JSON string
          resolve(json);
        }
      );
    });
  }
}
