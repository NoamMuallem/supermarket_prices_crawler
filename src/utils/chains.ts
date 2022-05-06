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
};
export default chainsConfigs;
