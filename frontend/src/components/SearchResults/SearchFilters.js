import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  Navbar,
  Form,
  Accordion,
  Button,
  Row,
  Col,
  Container,
  FormGroup,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import "./SearchFilters.css";
import { PLATFORMS_SUPPORTED, LISTINGS_TYPE } from "../../constants/Details";
import useQuery from "../../utils/useQuery";

const SearchFilters = (props) => {
  const [platformFilters, setPlatformFilters] = useState([]);
  const [typeFilters, setTypeFilters] = useState([]);
  const [sortKey, setSortKey] = useState("1");
  const history = useHistory();
  const query = useQuery();

  // function to set label of sort by dropdown
  const sortLabel = () => {
    switch (sortKey) {
      case "1":
        return "Relevance";
      case "2":
        return "Popularity";
      case "3":
        return "Recent";
      default:
        return "Sort by";
    }
  };

  // function for setting sort by after dropdown is selected
  const onSortSelect = (key, _) => {
    setSortKey(key);
  };

  // function for setting filters
  const setFilters = () => {
    // set both to zero
    setPlatformFilters([]);
    setTypeFilters([]);

    // get query params
    const platformParams = query.get("platform");
    const typeParams = query.get("listingtype");

    if (platformParams) {
      setPlatformFilters(platformParams.split("%"));
    }

    if (typeParams) {
      setTypeFilters(typeParams.split("%"));
    }
  };

  // set filters on mount
  useEffect(() => {
    setFilters();
  }, []);

  // handler if checkbox is changed
  const checkChangeHandler = (label, event) => {
    let newPlatformFilters = platformFilters;
    let newTypeFilters = typeFilters;

    switch (event.target.name) {
      case "platform":
        if (newPlatformFilters.includes(label)) {
          // remove
          newPlatformFilters = newPlatformFilters.filter(
            (value) => value !== label
          );
        } else {
          // add
          newPlatformFilters = [...newPlatformFilters, label];
        }
        break;
      case "listingtype":
        if (newTypeFilters.includes(label)) {
          // remove
          newTypeFilters = newTypeFilters.filter((value) => value !== label);
        } else {
          // add
          newTypeFilters = [...newTypeFilters, label];
        }
        break;
      default:
        break;
    }

    // generate new path
    const queryParams = [];

    if (newPlatformFilters) {
      queryParams.push(`platform=${newPlatformFilters.join("%")}`);
    }

    if (newTypeFilters) {
      queryParams.push(`listingtype=${newTypeFilters.join("%")}`);
    }

    history.replace({
      pathname: window.location.pathname,
      search: `?${queryParams.join("&")}`,
    });

    setFilters();
  };

  return (
    <Navbar
      bg="light"
      className="search-filters-container justify-content-between"
    >
      <div>
        <Accordion className="filter-accordion">
          <div>
            <Accordion.Toggle as={Button} variant="link" eventKey="0">
              Search Filters
            </Accordion.Toggle>
          </div>
          <Accordion.Collapse eventKey="0">
            <Container fluid>
              <Row>
                <Col md="auto">
                  <Form>
                    <FormGroup>
                      <Form.Label>Platforms</Form.Label>
                      {PLATFORMS_SUPPORTED.map((label, index) => (
                        <Form.Check
                          type="checkbox"
                          label={label}
                          key={index}
                          checked={platformFilters.includes(
                            label.replace(/ /g, "-")
                          )}
                          name="platform"
                          onChange={checkChangeHandler.bind(
                            this,
                            label.replace(/ /g, "-")
                          )}
                        />
                      ))}
                    </FormGroup>
                  </Form>
                </Col>
                <Col md="auto">
                  <Form>
                    <FormGroup>
                      <Form.Label>Listing Type</Form.Label>
                      {LISTINGS_TYPE.map((label, index) => (
                        <Form.Check
                          type="checkbox"
                          label={label}
                          key={index}
                          checked={typeFilters.includes(
                            label.replace(/ /g, "-")
                          )}
                          name="listingtype"
                          onChange={checkChangeHandler.bind(
                            this,
                            label.replace(/ /g, "-")
                          )}
                        />
                      ))}
                    </FormGroup>
                  </Form>
                </Col>
              </Row>
            </Container>
          </Accordion.Collapse>
        </Accordion>
      </div>
      <div className="d-flex flex-row align-items-center">
        <div className="mr-2">Sort by</div>
        <Dropdown as={ButtonGroup} alignRight>
          <Button variant="outline-dark">{sortLabel()}</Button>
          <Dropdown.Toggle split variant="outline-dark" />
          <Dropdown.Menu>
            <Dropdown.Item eventKey="1" onSelect={onSortSelect}>
              Relevance
            </Dropdown.Item>
            <Dropdown.Item eventKey="2" onSelect={onSortSelect}>
              Popularity
            </Dropdown.Item>
            <Dropdown.Item eventKey="3" onSelect={onSortSelect}>
              Recent
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </Navbar>
  );
};

export default SearchFilters;
