import axios from "@/utils/axios.ts";
import type {Aftersale} from "@/types/api.ts";

export const aftersalesPostService = (aftersalesModel: Aftersale) => {
    return axios.post('/aftersales', aftersalesModel);
};