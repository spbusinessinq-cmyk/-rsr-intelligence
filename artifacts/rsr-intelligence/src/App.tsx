import { Switch, Route, Router as WouterRouter } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Systems from "@/pages/Systems";
import SystemDetail from "@/pages/SystemDetail";
import Files from "@/pages/Files";
import FileDetail from "@/pages/FileDetail";
import Dossiers from "@/pages/Dossiers";
import DossierDetail from "@/pages/DossierDetail";
import World from "@/pages/World";
import SignalRoom from "@/pages/SignalRoom";
import InvestigationRoom from "@/pages/InvestigationRoom";

function Router() {
  return (
    <Switch>
      <Route path="/"                        component={Home} />
      <Route path="/systems"                 component={Systems} />
      <Route path="/systems/:slug"           component={SystemDetail} />
      <Route path="/files"                   component={Files} />
      <Route path="/files/:id"               component={FileDetail} />
      <Route path="/dossiers"                component={Dossiers} />
      <Route path="/dossiers/:id"            component={DossierDetail} />
      <Route path="/world"                   component={World} />
      <Route path="/signal-room"             component={SignalRoom} />
      <Route path="/investigation-room"      component={InvestigationRoom} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
