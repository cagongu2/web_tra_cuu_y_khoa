import { Outlet } from "react-router-dom";
import "./App.css";
import { Header } from "./components/Header";
import { Banner } from "./components/Banner";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <div className="flex flex-col min-h-screen items-center">
          <Banner />
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer/>
      </div>
    </>
  );
}

export default App;
