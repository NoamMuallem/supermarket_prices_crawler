import Handler from "./utils/handlers/abstract_handler";
import cerebrusHandler from "./utils/handlers/cerberus";
import { chainsHandlersEnum } from "./enums";
import ppt from "puppeteer";
import chainsConfig from "./utils/chains.js";

const main = async () => {
  //set up puppeteer
  const browser = await ppt.launch({ headless: false });
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
      (storeItemsJson: { [key: string]: any }) => console.log(storeItemsJson),
      (storeItemsJson: { [key: string]: any }) => console.log(storeItemsJson),
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
