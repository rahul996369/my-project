import { useMemo } from "react";
import { preprocessLaTeX } from "../utils/latexProcessor";

export const useLaTeXProcessor = (content: string) => {
    return useMemo(() => {
        return preprocessLaTeX(content);
    }, [content]);
};
