import puppeteer from "puppeteer";
import got from "got";
import { ungzip } from "node-gzip";

export async function getJsonFromGzDownloadLink(
  url: string,
  page: puppeteer.Page
) {
  await page.evaluate(async () => {
    // fetch file
    const { body } = await got(url, {
      responseType: "buffer",
    });

    // unzip the buffered gzipped sitemap
    const sitemap = (await ungzip(body)).toString();
    console.log(sitemap);
  });
}
