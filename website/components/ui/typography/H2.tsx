import { cva, VariantProps } from "class-variance-authority";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "~/lib/utils";

const h2Variants = cva(
  "mt-10 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0 dark:border-b-slate-700 dark:text-white",
  {
    variants: {
      variant: {
        normal: "pb-2 border-b border-b-slate-200",
        borderless: "",
      },
    },
    defaultVariants: {
      variant: "normal",
    },
  }
);

export interface H2Props
  extends ComponentPropsWithoutRef<"h2">,
    VariantProps<typeof h2Variants> {}

const H2 = forwardRef<HTMLHeadingElement, H2Props>(
  ({ className, variant, children, ...props }, ref) => (
    <h2 className={cn(h2Variants({ variant, className }))} {...props} ref={ref}>
      {children}
    </h2>
  )
);

H2.displayName = "H2";

export default H2;
