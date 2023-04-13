import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import Head from "next/head";
import Link from "next/link";
import Layout from "~/components/layouts/Layout";
import Markdown from "~/components/ui/Markdown";
import PackageCard from "~/components/ui/PackageCard";
import { NextPageWithLayout } from "~/lib/types";

const MOCK_DATA = [
  {
    name: "supabase-dbdev",
    handle: "supabase",
    partial_name: "dbdev",
    version: "0.1.0",
    control_description: "Install packages from the dbdev package index",
  },
  {
    name: "olirice-index_advisor",
    handle: "olirice",
    partial_name: "index_advisor",
    version: "1.0.2",
    control_description:
      "Recommend indexes to improve performance of a given query.",
  },
  {
    name: "langchain-embedding_search",
    handle: "langchain",
    partial_name: "embedding_search",
    version: "2.1.3",
    control_description: "Search documents by embedding and full text",
  },
];

const IndexPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>dbdev | The Database Package Manager</title>
      </Head>

      <div className="flex flex-col justify-center pb-20">
        <div className="mt-52">
          <h1 className="text-gray-900 dark:text-gray-100 text-2xl font-bold -translate-y-10 sm:text-4xl md:text-7xl">
            The Database
            <br />
            <span
              className="font-extrabold bg-center bg-no-repeat bg-cover bg-clip-text"
              style={{
                color: "transparent",
                backgroundImage:
                  "url('https://i.giphy.com/media/2tNvsKkc0qFdNhJmKk/giphy.webp'",
              }}
            >
              Package Manager
            </span>
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
          <div className="flex items-center space-x-4 mt-6">
            <Link
              href="/"
              className="rounded-md px-4 py-2 bg-gradient-to-br from-cyan-400 to-indigo-300 dark:from-cyan-400 dark:to-indigo-300 text-white font-bold"
            >
              Getting started
            </Link>
            <Link
              href="https://supabase.com/blog/dbdev-package-manager"
              className="group transition flex items-center space-x-2 border rounded-md px-4 py-2 bg-white dark:bg-transparent dark:border-slate-500 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-slate-400 text-gray-500 hover:text-gray-700 hover:border-gray-400"
            >
              <p>Read the blog post</p>
              <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition" />
            </Link>
          </div>
        </div>

        {/* Popular packages section */}
        <div className="mt-24 space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Popular packages
          </p>
          <div className="grid grid-cols-12 gap-4">
            {MOCK_DATA.map((pkg) => (
              <PackageCard key={pkg.name} pkg={pkg} />
            ))}
          </div>
        </div>

        {/* Getting started section */}
        <div className="mt-24 space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Getting started
          </p>
          <div className="space-y-2">
            <p className="dark:text-white">
              Simply install{" "}
              <code className="text-sm bg-gray-200 dark:bg-slate-600 px-1 py-1 rounded">
                pglets
              </code>{" "}
              via a SQL command
            </p>
            <Markdown className="dark:border dark:border-slate-700 rounded">
              {`\`\`\`sql
select dbdev.install('olirice-index_advisor');
\`\`\``}
            </Markdown>
          </div>
          <p className="dark:text-white">
            Where{" "}
            <code className="text-sm bg-gray-200 dark:bg-slate-600 px-1 py-1 rounded">
              olirice
            </code>{" "}
            is the handle of the publisher and{" "}
            <code className="text-sm bg-gray-200 dark:bg-slate-600 px-1 py-1 rounded">
              index_advisor
            </code>{" "}
            is the name of the pglet.
          </p>
        </div>
      </div>
    </>
  );
};

IndexPage.getLayout = (page) => <Layout gradientBg>{page}</Layout>;

export default IndexPage;
