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
  page: puppeteer.Page | undefined;

  constructor(
    username: string,
    password: string,
    browser: PromiseValue<ReturnType<typeof puppeteer.launch>>
  ) {
    super(browser);
    this.username = username;
    this.password = password;
  }

  async getAllStores(): Promise<string> {
    this.page = await this.browser.newPage();
    await this.getToHomescreen(this.page);
    await this.insertToSearch(this.page, "stores");
    await this.selectBiggestLimit(this.page);
    await this.clickOnUnzip(this.page);
    const json = await this.getFirstXMLInTable(this.page);
    await this.page.goBack();
    await this.page.close();
    this.page = undefined;
    return json;
  }

  //async getAllProductsInStore(
  //  chainId: string,
  //  subChainId: string
  //): Promise<string> {
  //  if (!this.page) {
  //    this.page = await this.browser.newPage();
  //  }
  //  this.page = await this.browser.newPage();
  //  await this.getToHomescreen(this.page);
  //  const searchTerm = `PriceFull${chainId}-${subChainId}`;
  //  this.clearSearch(this.page);
  //  console.log("now searching for: ", searchTerm);
  //  await this.insertToSearch(this.page, searchTerm);
  //  await this.selectBiggestLimit(this.page);
  //  await this.clickOnUnzip(this.page);
  //  await new Promise((resolve) => setTimeout(resolve, 2000));
  //  const json = await this.getFirstXMLInTable(this.page, false);
  //  await this.page.close();
  //  this.page = undefined;
  //  return json;
  //}

  private getToHomescreen = async (
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

  private insertToSearch = async (
    page: PromiseValue<ReturnType<typeof this.browser.newPage>>,
    text: string
  ) => {
    await page.waitForSelector("input[type='search']");
    await page.type("input[type='search']", text);
  };

  private clearSearch = async (
    page: PromiseValue<ReturnType<typeof this.browser.newPage>>
  ) => {
    await page.waitForSelector("input[type='search']");
    //@ts-ignore
    await page.$eval("input[type='search']", (el: Element) => (el.value = ""));
  };

  private selectBiggestLimit = async (
    page: PromiseValue<ReturnType<typeof this.browser.newPage>>
  ) => {
    await page.waitForSelector("select");
    await page.select("select", "1000");
  };

  private getFirstXMLInTable = async (
    page: PromiseValue<ReturnType<typeof this.browser.newPage>>,
    isInXMLForm: boolean = true
  ): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        await page.waitForSelector("td");
        const newPage = await page.evaluate(() => {
          return <HTMLAnchorElement>(
            // @ts-ignore: type element does have href on it!
            document.querySelectorAll("td > a")[0].href
          );
        });
        const xmlPage = await this.browser.newPage();
        if (isInXMLForm) {
          await xmlPage.goto(newPage.toString(), { waitUntil: "load" });
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        const xml = await xmlPage.evaluate(
          // @ts-ignore: type element does have href on it!
          () => document.querySelector("#folder0")!.innerText
        );
        xmlPage.close();
        const json = await this.parseXML(xml);
        resolve(json);
      }, 1000);
    });
  };

  private clickOnUnzip = async (
    page: PromiseValue<ReturnType<typeof this.browser.newPage>>
  ) => {
    await page.waitForSelector("#unzip-btn > span.t");
    await page.click("#unzip-btn > span.t");
  };
}
