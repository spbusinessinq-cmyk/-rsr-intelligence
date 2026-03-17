import { Switch, Route, Router as WouterRouter } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Systems from "@/pages/Systems";
import Files from "@/pages/Files";
import Dossiers from "@/pages/Dossiers";
import World from "@/pages/World";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/systems" component={Systems} />
      <Route path="/files" component={Files} />
      <Route path="/dossiers" component={Dossiers} />
      <Route path="/world" component={World} />
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
