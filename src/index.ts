import CerberusHandler from "./utils/handlers/cerberus";
import ppt from "puppeteer";

const main = async () => {
  //set up puppeteer
  const browser = await ppt.launch({ headless: false });
  let cerebrusHandler = new CerberusHandler("HaziHinam", "", browser);
  await cerebrusHandler.getAllStores();
  console.log("done!");
};

main()
  .catch((error) => {
    console.log(error);
  })
  .then(() => {
    console.log("script finished");
  });
