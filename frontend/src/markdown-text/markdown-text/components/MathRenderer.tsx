import { InlineMath, BlockMath } from 'react-katex';

export const mathComponents = {
    math: ({ value }: { value: string }) => (
        <div className="math-block">
            <BlockMath math={value} throwOnError={false} />
        </div>
    ),
    inlineMath: ({ value }: { value: string }) => (
        <InlineMath math={value} throwOnError={false} />
    ),
};
