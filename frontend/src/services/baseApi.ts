import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { config } from "../config/env";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: config.apiUrl,
    prepareHeaders: (headers: Headers) => {
      headers.set("X-Request-Time", new Date().toISOString());
      return headers;
    },
  }),
  endpoints: () => ({}),
});
