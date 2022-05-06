import { chainsHandlersEnum } from "../enums";

const chainsConfigs: { [key: string]: any } = {
  "טיב טעם": {
    url: "https://url.publishedprices.co.il/login",
    signin: {
      username: "TivTaam",
      password: "",
    },
    hostType: chainsHandlersEnum.cerberus,
  },
  "חצי חינם": {
    url: "https://url.publishedprices.co.il/login",
    signin: {
      username: "HaziHinam",
      password: "",
    },
    hostType: chainsHandlersEnum.cerberus,
  },
  "דור אלון": {
    url: "https://url.publishedprices.co.il/login",
    signin: {
      username: "doralon",
      password: "",
    },
    hostType: chainsHandlersEnum.cerberus,
  },
  יוחננוף: {
    url: "https://url.publishedprices.co.il/login",
    signin: {
      username: "yohananof",
      password: "",
    },
    hostType: chainsHandlersEnum.cerberus,
  },
  "עושא עד": {
    url: "https://url.publishedprices.co.il/login",
    signin: {
      username: "osherad",
      password: "",
    },
    hostType: chainsHandlersEnum.cerberus,
  },
};
export default chainsConfigs;
