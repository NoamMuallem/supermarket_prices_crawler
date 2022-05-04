import CerberusHandler from "./utils/handlers/cerberus";
import ppt from "puppeteer";
require("util").inspect.defaultOptions.depth = null;

const main = async () => {
  //set up puppeteer
  const browser = await ppt.launch({ headless: false });
  let cerebrusHandler = new CerberusHandler("HaziHinam", "", browser);
  const storesString = await cerebrusHandler.getAllStores();
  const storesJson = JSON.parse(storesString);
  console.log(storesJson);
  const chainId = storesJson["Root"]["ChainId"][0];
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
  const data = await cerebrusHandler.getAllProductsInStore(
    chainId,
    subChainsIds[0]
  );
  console.log("for chinId: ", subChainsIds[0], " ", data);
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
