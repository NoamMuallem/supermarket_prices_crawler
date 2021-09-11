import Handler from "./abstract_handler";
import puppeteer from "puppeteer";
import { PromiseValue } from "type-fest";

/**
 * CerberusHandler.
 *
 * @class CerberusHandler
 * @extends {Handler}
 */
export default class CerberusHandler extends Handler {
  username: string;
  password: string;

  constructor(
    username: string,
    password: string,
    browser: PromiseValue<ReturnType<typeof puppeteer.launch>>
  ) {
    super(browser);
    this.username = username;
    this.password = password;
  }

  async getAllStores() {
    const page = await this.browser.newPage();
    await this.getToHomescreen(page);
    await this.insertToSearch(page, "stores");
    await this.selectBiggestLimit(page);
    await this.clickOnUnzip(page);
    return await this.getFirstXMLInTable(page);
  }

  getToHomescreen = async (
    page: PromiseValue<ReturnType<typeof this.browser.newPage>>
  ) => {
    page.on("request", (request) => request.continue());
    await page.goto("https://url.publishedprices.co.il/login");
    await page.waitForSelector("#username");
    await page.waitForSelector("#password");
    await page.waitForSelector("#login-button");
    await page.focus("#username");
    await page.keyboard.type(this.username);
    await page.focus("#password");
    await page.keyboard.type(this.password);
    await page.click("#login-button");
  };

  insertToSearch = async (
    page: PromiseValue<ReturnType<typeof this.browser.newPage>>,
    text: string
  ) => {
    await page.waitForSelector("input[type='search']");
    await page.type("input[type='search']", text);
  };

  selectBiggestLimit = async (
    page: PromiseValue<ReturnType<typeof this.browser.newPage>>
  ) => {
    await page.waitForSelector("select");
    await page.select("select", "1000");
  };

  getFirstXMLInTable = async (
    page: PromiseValue<ReturnType<typeof this.browser.newPage>>
  ) => {
    setTimeout(async () => {
      await page.waitForSelector("td");
      const newPage = await page.evaluate(() => {
        // @ts-ignore: type element does have href on it!
        return <HTMLAnchorElement>document.querySelectorAll("td > a")[0].href;
      });
      const xmlPage = await this.browser.newPage();
      await xmlPage.goto(newPage.toString(), { waitUntil: "load" });
      const xml = await xmlPage.evaluate(
        // @ts-ignore: type element does have href on it!
        () => document.querySelector("#folder0")!.innerText
      );
      xmlPage.close();
      const json = await this.parseXML(xml);
      console.log(json);
    }, 1000);
  };

  clickOnUnzip = async (
    page: PromiseValue<ReturnType<typeof this.browser.newPage>>
  ) => {
    await page.waitForSelector("#unzip-btn > span.t");
    await page.click("#unzip-btn > span.t");
  };
}
