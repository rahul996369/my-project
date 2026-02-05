import { FC } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
//import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
//import { SyntaxHighlighter } from "../syntax-highlighter";

interface CodeHeaderProps {
    language?: string;
    code: string;
}

const CodeHeader: FC<CodeHeaderProps> = ({ language, code }) => {
    const { isCopied, copyToClipboard } = useCopyToClipboard();
    const onCopy = () => {
        if (!code || isCopied) return;
        copyToClipboard(code);
    };

    return (
        <div className="flex items-center justify-between gap-4 rounded-t-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            <span className="lowercase [&>span]:text-xs">{language}</span>
            {/* <TooltipIconButton
                tooltip="Copy"
                onClick={onCopy}
            >
                {!isCopied && <CopyIcon />}
                {isCopied && <CheckIcon />}
            </TooltipIconButton> */}
        </div>
    );
};

interface CodeBlockProps {
    className?: string;
    children: React.ReactNode;
}

export const CodeBlock: FC<CodeBlockProps> = ({
    className,
    children,
    ...props
}) => {
    const match = /language-(\w+)/.exec(className || "");

    if (match) {
        const language = match[1];
        const code = String(children).replace(/\n$/, "");

        return (
            <>
                <CodeHeader
                    language={language}
                    code={code}
                />
                {/* <SyntaxHighlighter
                    language={language}
                    className={className}
                >
                    {code}
                </SyntaxHighlighter> */}
            </>
        );
    }

    return (
        <code
            className={`rounded font-semibold ${className || ""}`}
            {...props}
        >
            {children}
        </code>
    );
};
