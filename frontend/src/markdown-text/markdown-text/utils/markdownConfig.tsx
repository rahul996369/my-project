import { cn } from "@/lib/utils";

export const defaultComponents: any = {
    h1: ({ className, ...props }: { className?: string }) => (
        <h1
            className={cn(
                "mb-8 scroll-m-20 text-3xl font-extrabold tracking-tight last:mb-0",
                className,
            )}
            {...props}
        />
    ),
    h2: ({ className, ...props }: { className?: string }) => (
        <h2
            className={cn(
                "mt-8 mb-4 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 last:mb-0",
                className,
            )}
            {...props}
        />
    ),
    h3: ({ className, ...props }: { className?: string }) => (
        <h3
            className={cn(
                "mt-6 mb-4 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 last:mb-0",
                className,
            )}
            {...props}
        />
    ),
    h4: ({ className, ...props }: { className?: string }) => (
        <h4
            className={cn(
                "mt-6 mb-4 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 last:mb-0",
                className,
            )}
            {...props}
        />
    ),
    h5: ({ className, ...props }: { className?: string }) => (
        <h5
            className={cn(
                "my-4 text-lg font-semibold first:mt-0 last:mb-0",
                className,
            )}
            {...props}
        />
    ),
    h6: ({ className, ...props }: { className?: string }) => (
        <h6
            className={cn("my-4 font-semibold first:mt-0 last:mb-0", className)}
            {...props}
        />
    ),
    p: ({ className, ...props }: { className?: string }) => (
        <p
            className={cn("mt-5 mb-5 leading-7 first:mt-0 last:mb-0", className)}
            {...props}
        />
    ),
    a: ({ className, ...props }: { className?: string }) => (
        <a
            className={cn(
                "text-primary font-medium underline underline-offset-4",
                className,
            )}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
        />
    ),
    blockquote: ({ className, ...props }: { className?: string }) => (
        <blockquote
            className={cn("border-l-2 pl-6 italic", className)}
            {...props}
        />
    ),
    ul: ({ className, ...props }: { className?: string }) => (
        <ul
            className={cn("my-5 ml-6 list-disc [&>li]:mt-2", className)}
            {...props}
        />
    ),
    ol: ({ className, ...props }: { className?: string }) => (
        <ol
            className={cn("my-5 ml-6 list-decimal [&>li]:mt-2", className)}
            {...props}
        />
    ),
    hr: ({ className, ...props }: { className?: string }) => (
        <hr
            className={cn("my-5 border-b", className)}
            {...props}
        />
    ),
    sup: ({ className, ...props }: { className?: string }) => (
        <sup
            className={cn("[&>a]:text-xs [&>a]:no-underline", className)}
            {...props}
        />
    ),
    strong: ({ className, ...props }: { className?: string }) => (
        <strong
            className={cn("font-bold", className)}
            {...props}
        />
    ),
    em: ({ className, ...props }: { className?: string }) => (
        <em
            className={cn("italic", className)}
            {...props}
        />
    ),
    pre: ({ className, ...props }: { className?: string }) => (
        <pre
            className={cn(
                "max-w-4xl overflow-x-auto rounded-lg bg-black text-white",
                className,
            )}
            {...props}
        />
    ),
};
