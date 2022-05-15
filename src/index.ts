import Handler from "./utils/handlers/abstract_handler";
import cerebrusHandler from "./utils/handlers/cerberus";
import { chainsHandlersEnum } from "./enums";
import ppt from "puppeteer";
import chainsConfig from "./utils/chains.js";
import fs from "fs";

const main = async () => {
  //set up puppeteer
  const browser = await ppt.launch({ headless: true });
  //set up copping data from stores:
  for (const [chainName, chainConfig] of Object.entries(chainsConfig)) {
    let handler: Handler;
    switch (chainConfig.hostType) {
      case chainsHandlersEnum.cerberus:
        handler = new cerebrusHandler(
          chainConfig.signin.username,
          chainConfig.signin.password,
          browser
        );
        break;
      default:
        handler = new cerebrusHandler(
          chainConfig.signin.username,
          chainConfig.signin.password,
          browser
        );
        break;
    }
    await handler.getAllProductsInAllStores(
      async (chainJson: { [key: string]: any }) => {
        if (!fs.existsSync(`${__dirname}/data/${chainName}/`)) {
          fs.mkdirSync(`${__dirname}/data/${chainName}/`, { recursive: true });
        }
        fs.writeFile(
          `${__dirname}/data/${chainName}/stores.json`,
          JSON.stringify(chainJson),
          (error) => {
            if (error) {
              console.log(error);
            }
            console.log(`${chainName} stores json was succefully saved`);
          }
        );
      },
      (storeItemsJson: { [key: string]: any }, storeId: string) => {
        if (!fs.existsSync(`${__dirname}/data/${chainName}/`)) {
          fs.mkdirSync(`${__dirname}/data/${chainName}/`, { recursive: true });
        }
        fs.writeFile(
          `${__dirname}/data/${chainName}/${storeId}.json`,
          JSON.stringify(storeItemsJson),
          (error) => {
            if (error) {
              console.log(error);
            }
            console.log(
              `${chainName} store id ${storeId} json was successfully saved`
            );
          }
        );
      },
      chainName
    );
  }
  //let cerebrusHandler = new CerberusHandler("HaziHinam", "", browser);
  console.log("done!");
};

main()
  .catch((error) => {
    console.log(error);
    process.exit(1);
  })
  .then(() => {
    console.log("script finished");
    process.exit(0);
  });
