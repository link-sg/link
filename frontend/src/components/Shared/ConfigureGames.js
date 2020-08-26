import React, { useState, useEffect } from "react";
import "./ConfigureGames.css";
import {
  Modal,
  Button,
  OverlayTrigger,
  Tooltip,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { BACKEND_ADDRESS, PLATFORMS_SUPPORTED } from "../../constants/Details";
import { useAPI } from "../../utils/useAPI";

const ConfigureGames = (props) => {
  const [sendRequest, isLoading] = useAPI();
  const dispatch = props.dispatchUpdate;
  const [selectedGames, setSelectedGames] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [query, setQuery] = useState([]);

  // set up initial selected games based on props
  useEffect(() => {
    setSelectedGames(props.selectedGames);
  }, [props]);

  // get games for selection from backend
  useEffect(() => {
    const selectedGamesID = selectedGames.map((game) => game._id);

    const getGames = async () => {
      const responseData = await sendRequest("/api/game", "PATCH", {
        title: query.title,
        platform: query.platform,
        gamesToHide: selectedGamesID,
        page: query.page,
      });
      if (responseData) {
        setAvailableGames(responseData.queryData.matchedData);
        // setPageData(responseData.queryData.pageData);
      }
    };

    getGames();
  }, [query]);

  // deselect game when clicked
  const deselect = (deselectedGame) => {
    setSelectedGames(selectedGames.filter((game) => game !== deselectedGame));
  };

  return (
    <Modal show={props.show} onHide={props.toggle} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{props.label}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Your {props.label}</p>
        <div className="d-flex">
          {selectedGames.map((game, index) => (
            <div key={index} onClick={() => deselect(game)}>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{game.title}</Tooltip>}
              >
                <img
                  src={BACKEND_ADDRESS + game.imageURL}
                  alt={game.title}
                  className="configure-games-img"
                />
              </OverlayTrigger>
            </div>
          ))}
        </div>
        <hr></hr>
        <p className="d-flex align-items-center justify-content-between">
          <InputGroup className="w-75">
            <FormControl placeholder="Add games" />
          </InputGroup>
        </p>
        <div className="d-flex">
          {availableGames.map((game, index) => (
            <div key={index} onClick={() => {}}>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{game.title}</Tooltip>}
              >
                <img
                  src={BACKEND_ADDRESS + game.imageURL}
                  alt={game.title}
                  className="configure-games-img"
                />
              </OverlayTrigger>
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-danger" onClick={props.toggle}>
          Close
        </Button>
        <Button variant="outline-dark">Save Changes</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfigureGames;
