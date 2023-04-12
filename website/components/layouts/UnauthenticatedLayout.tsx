import { PropsWithChildren } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const UnauthenticatedLayout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <div className="flex flex-col h-full dark:bg-slate-900">
      <Navbar />

      <main className="flex flex-col flex-1 w-full max-w-3xl px-4 mx-auto mt-8">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default UnauthenticatedLayout;
