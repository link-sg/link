import React, { useState, useEffect, useCallback } from "react";

import { useAPI } from "../utils/useAPI";

import Header from "../components/Header/Header";
import Platforms from "../components/Home/Platforms";
import HomeListing from "../components/Home/HomeListing";
import { Jumbotron, Container } from "react-bootstrap";

const Main = (props) => {
  const [sendRequest, isLoading] = useAPI();
  const [listings, setListings] = useState([]);

  // get listings to display on front page
  useEffect(() => {
    // async function to get listings
    const getListings = async () => {
      const listingsFromServer = await sendRequest(`/api/listing/recent`);
      if (listingsFromServer) {
        setListings(listingsFromServer.mostRecentListings);
      }
    };

    // call async function
    getListings();
  }, [sendRequest]);

  // function to display listings
  const displayListings = useCallback(() => {
    if (isLoading) {
      // loading screen
      return <div>Loading</div>;
    } else {
      return listings.map((listing) => (
        <HomeListing
          title={listing.hasItem.title}
          description={listing.description}
          image={listing.hasItem.imageURL}
          id={listing._id}
          key={listing._id}
          platform={listing.hasItem.platform}
          isTrading={listing.wantsItem.length > 0}
          isRenting={listing.rentalPrice}
          isSelling={listing.sellingPrice}
        />
      ));
    }
  }, [listings, isLoading]);

  return (
    <div className="mainScreen">
      <Header />
      <Jumbotron fluid>
        <Container>
          <h1>Welcome to the Secret Shop</h1>
          <p>The one-stop destination for all your video game needs.</p>
        </Container>
      </Jumbotron>
      <div style={styles.display}>
        <Platforms />
        <div style={styles.listings}>{displayListings()}</div>
      </div>
    </div>
  );
};

// styles
const styles = {
  display: {
    width: "100%",
    marginTop: "5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  listings: {
    marginTop: "5rem",
    width: "100%",
  },
};

export default Main;
