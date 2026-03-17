import { Switch, Route, Router as WouterRouter } from "wouter";
import { AuthProvider, ProtectedRoute } from "@/lib/auth";
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
import Access from "@/pages/Access";
import Briefing from "@/pages/Briefing";
import Command from "@/pages/Command";

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
      <Route path="/investigation-room">
        {() => <ProtectedRoute component={InvestigationRoom} />}
      </Route>
      <Route path="/command">
        {() => <ProtectedRoute component={Command} adminOnly />}
      </Route>
      <Route path="/access"                  component={Access} />
      <Route path="/briefing"               component={Briefing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </WouterRouter>
  );
}

export default App;
