import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Filters from "./components/Filters";
import Footer from "./components/Footer";
import PackageList from "./components/PackageList";

export default function Index() {
  return (
    <>
      <div className="min-h-full">
        <Nav />
        <main>

            <div className="grid grid-cols-1 items-start lg:grid-cols-3 divide-x">
              {/* Left column */}
              <div className="grid grid-cols-1 gap-4 lg:col-span-2 divide-y">
                <section>
                  <Hero />
                </section>
                <section>
                  <PackageList />
                </section>
              </div>
              {/* Right column */}
              <div className="grid grid-cols-1 gap-4 ">
                <FilterBar />
              </div>
            </div>

        </main>
        <Footer />
      </div>
    </>
  );
}

const FilterBar = () => (
  <section>
      <Filters />
  </section>
);
