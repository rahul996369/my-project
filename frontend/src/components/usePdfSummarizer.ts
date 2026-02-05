import { useRef, useState } from "react";
import { useSummarizePdfMutation, useUploadPdfMutation } from "../services/chatApi";

const MAX_PDF_SIZE_MB = 10;
const MAX_PDF_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

type SummarizeResult = { reply?: string; error?: string };

export function usePdfSummarizer() {
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadPdf, { isLoading: isUploadingPdf }] = useUploadPdfMutation();
  const [summarizePdf, { isLoading: isSummarizingPdf }] = useSummarizePdfMutation();

  const isLoading = isUploadingPdf || isSummarizingPdf;

  const openPicker = () => fileInputRef.current?.click();

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") return;
    setSelectedPdf(file);
    e.target.value = "";
  };

  const clearSelectedPdf = () => setSelectedPdf(null);

  const summarizeSelectedPdf = async (optionalMessage: string): Promise<SummarizeResult> => {
    if (!selectedPdf || isLoading) return {};

    const pdfToUpload = selectedPdf;
    setSelectedPdf(null);

    if (pdfToUpload.size > MAX_PDF_BYTES) {
      return { error: `PDF is too large. Maximum size is ${MAX_PDF_SIZE_MB} MB.` };
    }

    try {
      const { uploadId } = await uploadPdf(pdfToUpload).unwrap();
      const response = await summarizePdf({
        uploadId,
        message: optionalMessage.trim().length > 0 ? optionalMessage : undefined,
      }).unwrap();
      return { reply: response.reply };
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err && err.data && typeof (err.data as { error?: string }).error === "string"
          ? (err.data as { error: string }).error
          : "Sorry, there was an error summarizing the PDF.";
      return { error: message };
    }
  };

  return {
    // state
    selectedPdf,
    selectedPdfName: selectedPdf?.name ?? null,
    isPdfLoading: isLoading,

    // refs
    fileInputRef,

    // actions
    openPicker,
    handlePdfSelect,
    clearSelectedPdf,
    summarizeSelectedPdf,
  };
}

