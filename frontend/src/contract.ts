import { extractContract } from "@rest-rpc/core";
import { router } from "backend/router";

export const getApi = () => extractContract(router);
