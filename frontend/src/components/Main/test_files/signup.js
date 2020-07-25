import React, { useState, useCallback, useEffect, useReducer } from "react";
import "../login.css";
import "../../../constants/styles/Bootstrap.css";
import { FaUserCircle } from "react-icons/fa";

// reducer for signup data
const formReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE":
      // update field values
      const updatedValues = {
        ...state.inputValues,
        [action.input]: action.value,
      };
      // TODO: validities

      // return updated state
      return {
        ...state,
        inputValues: updatedValues,
      };
    default:
      return state;
  }
};

function Signup(props) {
  // use reducer for signup data
  const [formState, dispatchForm] = useReducer(formReducer, {
    inputValues: {
      username: "",
      email: "",
      password: "",
      confirmedPassword: "",
      // TODO: check if handling password securely
    },
    // TODO: input validities
  });

  // input handler for all fields
  const inputChangeHandler = (inputIdentifier, value) => {
    // isValid for third parameter

    // test
    console.log(value);

    // dispatch to reducer
    dispatchForm({
      type: "UPDATE",
      value: value,
      input: inputIdentifier,
      // TODO: add validity here as another value
    });
  };

  const escFunction = useCallback((event) => {
    if (event.keyCode === 27) {
      props.signupFormHandler();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);

    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, []);

  return (
    <div className="wrapper">
      <div id="formContent">
        <div className="closebutton" onClick={props.closeButtonHandler}>
          X
        </div>
        <div
          style={{ paddingTop: 10, paddingBottom: 10 }}
          className="fadeIn first"
        >
          <FaUserCircle size={61} />
        </div>
        <form>
          <input
            type="text"
            id="username"
            className="fadeIn input textthing"
            name="login"
            placeholder="username"
            onChange={(e) => inputChangeHandler(e.target.id, e.target.value)}
          />
          <input
            type="email"
            id="email"
            className="fadeIn input textthing"
            name="login"
            placeholder="email"
            onChange={(e) => inputChangeHandler(e.target.id, e.target.value)}
          />
          <input
            type="password"
            id="password"
            className="fadeIn input textthing"
            name="login"
            placeholder="password"
            onChange={(e) => inputChangeHandler(e.target.id, e.target.value)}
          />
          <input
            type="password"
            id="passwordConfirmed"
            className="fadeIn input textthing"
            name="login"
            placeholder="confirm password"
            onChange={(e) => inputChangeHandler(e.target.id, e.target.value)}
          />
          <input
            type="submit"
            className="fadeIn      input"
            value="Create Account"
          />
        </form>
      </div>
    </div>
  );
}

export default Signup;
