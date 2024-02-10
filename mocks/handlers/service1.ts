import { http, HttpResponse } from "msw";
import { jsonActivities } from "../data/activities.ts";

export const service1 = [
   http.get("https://activity.com.mx/v2/rates", () => {
      return HttpResponse.json(jsonActivities);
   }),
];
