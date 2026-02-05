import { cn } from "@/lib/utils";

export const tableComponents = {
    table: ({ className, ...props }: { className?: string }) => (
        <div className="my-5 table-wrapper rounded-lg border overflow-x-auto">
            <table
                className={cn(
                    "border-separate border-spacing-0",
                    className,
                )}
                style={{ tableLayout: 'auto', width: 'max-content', minWidth: '100%' }}
                {...props}
            />
        </div>
    ),
    th: ({ className, ...props }: { className?: string }) => (
        <th
            className={cn(
                "bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right",
                className,
            )}
            style={{
                whiteSpace: 'nowrap',
                wordWrap: 'normal',
                overflowWrap: 'normal',
                lineHeight: '1.4',
                minWidth: 'fit-content'
            }}
            {...props}
        />
    ),
    td: ({ className, ...props }: { className?: string }) => (
        <td
            className={cn(
                "border-b border-l px-4 py-2 text-left break-words whitespace-normal last:border-r [&[align=center]]:text-center [&[align=right]]:text-right",
                className,
            )}
            style={{ 
                wordWrap: 'break-word', 
                overflowWrap: 'anywhere',
                whiteSpace: 'normal',
                minWidth: '100px'
            }}
            {...props}
        />
    ),
    tr: ({ className, ...props }: { className?: string }) => (
        <tr
            className={cn(
                "m-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg",
                className,
            )}
            {...props}
        />
    ),
};
