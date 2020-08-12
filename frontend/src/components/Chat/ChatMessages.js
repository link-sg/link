import React, { useState, useEffect } from "react";
import "./ChatMessages.css";
import { BACKEND_ADDRESS } from "../../constants/Details";
import { useAPI } from "../../utils/useAPI";
import { InputGroup, FormControl, Button } from "react-bootstrap";

const ChatMessages = (props) => {
  const [sendRequest] = useAPI();
  const [chatData, setChatData] = useState();
  const [chatIsLoading, setChatIsLoading] = useState(false);
  // unpack user data
  const { userID, recipientID, recipientName, recipientImage } = props.userData;
  console.log(chatData);

  // function to display contents of chat message
  const displayChatMessage = (message) => {
    if (message.sentBySelf) {
      return (
        <div className="message-box message-by-you">
          <div>{message.content}</div>
          <img
            className="chat-message-img"
            src={BACKEND_ADDRESS + recipientImage}
          />
        </div>
      );
    } else {
      return (
        <div className="message-box message-by-rec">
          <img
            className="chat-message-img"
            src={BACKEND_ADDRESS + recipientImage}
          />
          <div>{message.content}</div>
        </div>
      );
    }
  };

  // get chat data if user/recipient changes or on page load
  useEffect(() => {
    if (userID && recipientID) {
      setChatIsLoading(true);
      sendRequest("/api/chat/specific", "PATCH", { userID, recipientID }).then(
        (responseData) => {
          setChatData(responseData.matchedChatLog);
        }
      );
      setChatIsLoading(false);
    }
  }, [userID, recipientID]);

  // return no chat selected if no recipientID
  if (!chatData) {
    return <div className="chat-messages-display">No chat selected</div>;
  }

  if (chatIsLoading) {
    return <div>loading</div>;
  }

  return (
    <div className="chat-messages-display">
      <div className="chat-messages-label">{recipientName}</div>
      <div className="chat-messages-log">
        {chatData.messages.map(displayChatMessage)}
      </div>
      <InputGroup>
        <FormControl placeholder="Message" />
        <InputGroup.Append>
          <Button variant="secondary">Send</Button>
        </InputGroup.Append>
      </InputGroup>
    </div>
  );
};

export default ChatMessages;
