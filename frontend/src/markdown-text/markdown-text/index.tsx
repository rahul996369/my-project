"use client";

import ReactMarkdown from "react-markdown";
import RehypeKatex from 'rehype-katex'
import RemarkMath from 'remark-math'
import RemarkGfm from 'remark-gfm'
import RehypeRaw from 'rehype-raw'
//import rehypeMathjax from 'rehype-mathjax';
import { FC, memo } from "react";
import { cn } from "@/lib/utils";

// Import styles
import "./styles/markdown.css";
import "./styles/table.css";
import "./styles/code.css";

// Import components and hooks
import { markdownComponents } from "./components/MarkdownComponents";
import { useLaTeXProcessor } from "./hooks/useLaTeXProcessor";

import "katex/dist/katex.min.css";

interface MarkdownTextProps {
    children: string;
    className?: string;
}

const MarkdownTextImpl: FC<MarkdownTextProps> = ({
    children,
    className,
}) => {
    const processedContent = useLaTeXProcessor(children);

    return (
        <div className={cn("markdown-content", className)}>
            <ReactMarkdown
                remarkPlugins={[
                    RemarkGfm,
                    [RemarkMath, { singleDollarTextMath: false }],
                ]}
                rehypePlugins={[
                    RehypeKatex, 
                    RehypeRaw as any,
                    //rehypeMathjax
                ]}
                components={markdownComponents}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
};

export const MarkdownText = memo(MarkdownTextImpl);