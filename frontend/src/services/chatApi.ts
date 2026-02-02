import { baseApi } from "./baseApi";

export interface ChatResponse {
  reply: string;
}

export interface ChatRequest {
  message: string;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    processChat: builder.mutation<
      ChatResponse,
      ChatRequest
    >({
      query: (body) => ({
        url: "/chat",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useProcessChatMutation } = chatApi;
