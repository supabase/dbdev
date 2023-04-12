import { PropsWithChildren } from "react";
import { cn } from "~/lib/utils";
import Navbar from "./Navbar";
import Footer from "./Footer";

export type LayoutProps = {
  containerWidth?: "md" | "full";
};

const Layout = ({
  containerWidth = "md",
  children,
}: PropsWithChildren<LayoutProps>) => {
  return (
    <div className="flex flex-col h-full dark:bg-slate-900">
      <Navbar />

      <main
        className={cn(
          "flex flex-col flex-1 w-full mt-8",
          containerWidth === "md" && "max-w-3xl px-4 mx-auto"
        )}
      >
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
