export const preprocessLaTeX = (content: string): string => {
    if (typeof content !== 'string') return content;

    const codeBlockRegex = /```[\s\S]*?```/g;
    const codeBlocks = content.match(codeBlockRegex) || [];
    let processedContent = content.replace(codeBlockRegex, 'CODE_BLOCK_PLACEHOLDER');

    // Protect currency values from being interpreted as LaTeX math delimiters
    // Match $ followed by digits, but NOT if it's part of a LaTeX expression
    // The negative lookahead ensures we don't match if followed by math operators or LaTeX syntax
    const currencyRegex = /\$\d+(?:,\d{3})*(?:\.\d{2})?(?!\s*[+\-*/=<>^_{}\\]|\$)/g;
    const currencyMatches = processedContent.match(currencyRegex) || [];
    processedContent = processedContent.replace(currencyRegex, 'CURRENCY_PLACEHOLDER');

    const cleanMath = (str: string) => {
        return str
            // First, normalize backslashes to prevent parsing issues
            .replace(/\\{2,}/g, '\\')
            // Handle all variations of \right: \right, \\right, right, and even "ight" (in case "r" is stripped)
            .replace(/\\*r?ight\s*\)/g, ')')    // Matches \right, \\right, right, or ight)
            .replace(/ight\s*\)/g, ')')          // Catch any remaining "ight)" cases (fallback)
            // Handle all variations of \left: \left, \\left, left
            .replace(/\\*left\s*\(/g, '(')       // Matches \left, \\left, or left
            // Keep frac properly formatted
            .replace(/\\frac/g, '\\frac')
            // Add space to prevent "textSubtotal" cramping
            .replace(/\\text\s*\{/g, '\\text{ ')
            // Use × symbol for multiplication (matches image format)
            .replace(/\\times/g, '×')
            .replace(/\*/g, '×')                  // Also convert * to ×
            .replace(/\\div/g, '/')
            .replace(/÷/g, '/')
            // Clean up any remaining backslash issues
            .replace(/\\+/g, '\\');
    };

    processedContent = processedContent
        .replace(/(?:\\{1,2}\[)([\s\S]*?)(?:\\{1,2}\])/g, (_, eq) => {
            return `\n$$\n${cleanMath(eq)}\n$$\n`;
        })
        .replace(/\$\$([\s\S]*?)\$\$/g, (_, eq) => {
            return `\n$$\n${cleanMath(eq)}\n$$\n`;
        })
        .replace(/(?:\\{1,2}\()([\s\S]*?)(?:\\{1,2}\))/g, (_, eq) => {
            return `$${cleanMath(eq)}$`;
        });

    // Restore currency values, but escape the $ sign so it's not interpreted as LaTeX
    // We use HTML entity &#36; which renders as $ but won't be parsed as a math delimiter
    let currencyIndex = 0;
    processedContent = processedContent.replace(/CURRENCY_PLACEHOLDER/g, () => {
        const currency = currencyMatches[currencyIndex++];
        // Replace $ with HTML entity to prevent it from being interpreted as a math delimiter
        //return currency.replace(/\$/g, '&#36;');
        return currency;
    });
    codeBlocks.forEach(block => processedContent = processedContent.replace('CODE_BLOCK_PLACEHOLDER', block));

    return processedContent;
};