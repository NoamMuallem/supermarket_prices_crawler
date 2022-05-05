import puppeteer from "puppeteer";
import zlib from "zlib";
import path from "path";
import fs from "fs";

export async function getJsonFromGzDownloadLink(
  url: string,
  page: puppeteer.Page
) {
  const directoryPath = path.join(__dirname, "temp");
  await downloadFile(url, page, directoryPath);
  await sleep(4000);
  const file = grabDownloadedFile(directoryPath);
  extractXmlFile(file, directoryPath);
  await sleep(4000);
  const xml = readExtractedXml();
  return xml;
}

function removeFromFileSystem(dir: string) {
  fs.rm(dir, { recursive: true }, (err) => {
    if (err) {
      throw err;
    }
  });
}

function createDirectoryIfNotExisting(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

async function sleep(ms: number) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadFile(
  url: string,
  page: puppeteer.Page,
  directoryPath: string
) {
  console.log(directoryPath);
  // @ts-ignore
  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: directoryPath,
  });
  //download the zg
  try {
    createDirectoryIfNotExisting(directoryPath);
    await page.goto(url);
  } catch (e) {
    console.log(e.toString())
  }
}

function grabDownloadedFile(directoryPath: string): string {
  const zgs: Array<string> = [];
  const files = fs.readdirSync(directoryPath);
  //listing all files using forEach
  files.forEach(function (file) {
    // Do whatever you want to do with the file
    zgs.push(file);
  });
  return zgs[0];
}

async function extractXmlFile(file: string, directoryPath: string) {
  const r = fs.createReadStream(`./temp/${file}`);
  const z = zlib.createGunzip();
  const w = fs.createWriteStream("temp.xml");
  r.pipe(z).pipe(w);
  removeFromFileSystem(directoryPath);
}

function readExtractedXml() {
  const filename = path.join(__dirname, "temp.xml");
  const data = fs.readFileSync(filename, "utf8");
  removeFromFileSystem("temp.xml");
  return data;
}
