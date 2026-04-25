import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { NameEntry } from "./components/NameEntry";
import { Podium } from "./components/Podium";
import { TournamentView } from "./components/TournamentView";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<NameEntry />} />
        <Route path="/jatek" element={<TournamentView />} />
        <Route path="/eredmeny" element={<Podium />} />
      </Route>
    </Routes>
  );
}
