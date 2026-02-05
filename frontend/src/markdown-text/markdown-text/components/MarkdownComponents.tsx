import { defaultComponents } from "../utils/markdownConfig";
import { tableComponents } from "./TableRenderer";
import { mathComponents } from "./MathRenderer";
import { CodeBlock } from "./CodeBlock";

export const markdownComponents = {
    ...defaultComponents,
    ...tableComponents,
    ...mathComponents,
    code: CodeBlock,
};
