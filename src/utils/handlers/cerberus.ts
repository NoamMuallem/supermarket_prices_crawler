import Handler from "./abstract_handler";
import puppeteer from "puppeteer";
import { PromiseValue } from "type-fest";
import { getJsonFromGzDownloadLink } from "../../getJsonFromGzipDownloadLink";
require("util").inspect.defaultOptions.depth = null;

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

  async getAllStores(
    cb: Function | undefined
  ): Promise<{ [key: string]: any } | null> {
    this.page = await this.browser.newPage();
    await this.getToHomescreen(this.page);
    await this.insertToSearch(this.page, "stores");
    await this.selectBiggestLimit(this.page);
    await this.clickOnUnzip(this.page);
    try {
      const json = await this.getFirstXMLInTable(this.page);
      await this.page.goBack();
      await this.page.close();
      this.page = undefined;
      if (cb) {
        cb(json);
      }
      return json;
    } catch (e) {
      return null;
    }
  }

  async getAllProductsInAllStores(
    chainJsonCb: Function | undefined,
    singleStoreJsonCb: Function | undefined,
    chainName: string | undefined
  ) {
    console.log("now doing: ", chainName);
    const storesJson = await this.getAllStores(
      (json: { [key: string]: any } | null) => {
        if (json && chainJsonCb) {
          chainJsonCb(json);
        }
      }
    );
    // @ts-ignore
    const chainId = storesJson["Root"]["ChainId"][0];
    // @ts-ignore
    const subChainsIds = storesJson["Root"]["SubChains"][0]["SubChain"][0][
      "Stores"
    ][0]["Store"]
      .map((storeObj: { [key: string]: any }) => storeObj.StoreId[0])
      .map((storeId: string) =>
        storeId.length === 1
          ? "00" + storeId
          : storeId.length === 2
          ? "0" + storeId
          : storeId
      );

    for (let index = 0; index < subChainsIds.length; index++) {
      console.log(index + "/" + subChainsIds.length);
      const data = await this.getAllProductsInStore(
        chainId,
        subChainsIds[index]
      );
      if (data && singleStoreJsonCb) {
        singleStoreJsonCb(data);
      }
    }
  }

  async getAllProductsInStore(
    chainId: string,
    subChainId: string
  ): Promise<{ [key: string]: any }> {
    if (!this.page) {
      this.page = await this.browser.newPage();
    }
    await this.getToHomescreen(this.page);
    const searchTerm = `PriceFull${chainId}-${subChainId}`;
    this.clearSearch(this.page);
    await this.insertToSearch(this.page, searchTerm);
    await this.selectBiggestLimit(this.page);
    await this.clickOnUnzip(this.page);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const json = await this.getFirstXMLInTable(this.page, true);
    const fomattedJson = this.formatProductsJson(json);
    return fomattedJson;
  }

  private formatProductsJson = (json: {
    [key: string]: any;
  }): { [key: string]: any } => {
    const formattedJson: { [key: string]: any } = {};
    let Items: { [key: string]: any };
    try {
      formattedJson["ChainId"] = json["Root"]["ChainId"][0];
      formattedJson["StoreId"] = json["Root"]["StoreId"][0];
      Items = json["Root"]["Items"][0]["Item"];
    } catch (e) {
      formattedJson["ChainId"] = json["root"]["ChainId"][0];
      formattedJson["StoreId"] = json["root"]["StoreId"][0];
      Items = json["root"]["Items"][0]["Item"];
    }
    formattedJson["Items"] = [];
    Items.forEach((Item: { [key: string]: any }) => {
      const formattedItem: { [key: string]: any } = {};
      formattedItem["code"] = Item["ItemCode"][0];
      formattedItem["name"] = Item["ItemName"][0];
      formattedItem["price"] = Item["ItemPrice"][0];
      formattedJson["Items"].push(formattedItem);
    });
    return formattedJson;
  };

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
    isFile: boolean = false
  ): Promise<{ [key: string]: any }> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        await page.waitForSelector("td");
        let newPage;
        try {
          newPage = await page.evaluate(() => {
            return <HTMLAnchorElement>(
              // @ts-ignore: type element does have href on it!
              document.querySelectorAll("td > a")[0].href
            );
          });
        } catch (e) {
          //no products for that store id are existing...
          reject();
        }
        if (newPage) {
          const xmlPage = await this.browser.newPage();
          if (isFile) {
            const productsXml = await getJsonFromGzDownloadLink(
              newPage.toString(),
              this.page!
            );
            const json = await this.parseXML(productsXml);
            xmlPage.close();
            resolve(json);
          } else {
            await xmlPage.goto(newPage.toString(), { waitUntil: "load" });
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const xml = await xmlPage.evaluate(
              // @ts-ignore: type element does have href on it!
              () => document.querySelector("#folder0")!.innerText
            );
            const json = await this.parseXML(xml);
            xmlPage.close();
            resolve(json);
          }
        } else {
          reject();
        }
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
