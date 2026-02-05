import { baseApi } from "./baseApi";

export interface ChatResponse {
  reply: string;
}

export interface ChatRequest {
  message: string;
}

export interface UploadPdfResponse {
  uploadId: string;
}

export interface SummarizePdfRequest {
  uploadId: string;
  message?: string;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    processChat: builder.mutation<ChatResponse, ChatRequest>({
      query: (body) => ({
        url: "/chat",
        method: "POST",
        body,
      }),
    }),
    uploadPdf: builder.mutation<UploadPdfResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "/api/upload-pdf",
          method: "POST",
          body: formData,
        };
      },
    }),
    summarizePdf: builder.mutation<ChatResponse, SummarizePdfRequest>({
      query: (body) => ({
        url: "/chat/summarize-pdf",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useProcessChatMutation,
  useUploadPdfMutation,
  useSummarizePdfMutation,
} = chatApi;
