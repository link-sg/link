import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import SearchResult from "./screens/SearchResult";
import ClientSideErrorsPage from "./screens/errors/ClientSideErrorsPage";
import ListingDetails from "./screens/ListingDetails";
import Main from "./screens/Main";
import ServerError from "./screens/errors/ServerSideErrorPage";

const RoutingTable = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Main} />
        <Route path="/search" component={SearchResult} />
        <Route path="/listing" component={ListingDetails} />
        <Route exact path="/error/500" component={ServerError} />
        <Route
          component={ClientSideErrorsPage}
          err={{
            message: "The page you are requesting for could not be found",
            status: 404,
          }}
        />
        {/* Routes client to ClientSideErrorsPage page if path does not match any of the others*/}
      </Switch>
    </Router>
  );
};

export default RoutingTable;
