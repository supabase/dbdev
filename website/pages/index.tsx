import Head from "next/head";
import Link from "next/link";
import Layout from "~/components/layouts/Layout";
import { NextPageWithLayout } from "~/lib/types";

const IndexPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>dbdev | The Database Package Manager</title>
      </Head>

      <div className="flex flex-col justify-center flex-1">
        <h1 className="text-gray-900 dark:text-gray-100 text-2xl font-extrabold -translate-y-10 sm:text-4xl md:text-7xl">
          The Database
          <br />
          Package Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-xl -mt-4">
          For PostgreSQL trusted language extensions{" "}
          <Link
            href="https://github.com/aws/pg_tle"
            className="border-b-2 border-gray-300 hover:border-gray-500 dark:border-slate-700 dark:hover:border-slate-500 transition"
          >
            (TLEs)
          </Link>
        </p>
      </div>
    </>
  );
};

IndexPage.getLayout = (page) => <Layout>{page}</Layout>;

export default IndexPage;
