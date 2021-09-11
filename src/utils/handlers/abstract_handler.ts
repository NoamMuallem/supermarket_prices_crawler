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

  async getAllStores() {
    throw new Error("Method 'say()' must be implemented.");
  }

  async getFullPrises() {
    throw new Error("Method 'getFullPrises()' must be implemented.");
  }

  protected parseXML(xml: string) {
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
          const json = JSON.stringify(result, null, 4);
          // log JSON string
          resolve(json);
        }
      );
    });
  }
}
