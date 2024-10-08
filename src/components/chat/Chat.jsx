import React from 'react';
import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { format } from "timeago.js";
import { encryptMessage,decryptMessage } from '../../lib/encryption';
import { x3dhKeyExchange } from '../../utils/x3dhUtils'; 
import naclUtil from 'tweetnacl-util'; 
import { nacl } from 'tweetnacl';
import { getPrivateKey } from '../../utils/indexedDB';

const Chat = () => {
  const [chat, setChat] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);
  useEffect(() => {
    const setupChat = async () => {
      const privateKeys = await getPrivateKey(currentUser.id);
      if (privateKeys) {
        console.log("Private keys for chat", privateKeys);
        // Use the private keys for message encryption/decryption
      }
    };
  
    setupChat();
  }, [currentUser.id]);
  useEffect(() => {
    if (chat?.messages) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat?.messages]);

  useEffect(() => {
    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      const chatData = res.data();
  
      
      const secretKey = "7068616D6B68756F6E6763756F6E673239313032303033";  
      const decryptedMessages = chatData.messages.map((message) => {
        return {
          ...message,
          text: decryptMessage(message.text, secretKey),
        };
      });
  
      setChat({ ...chatData, messages: decryptedMessages });
    });
  
    return () => {
      unSub();
    };
  }, [chatId]);
  

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      const secretKey = "7068616D6B68756F6E6763756F6E673239313032303033";  
      const encryptedText = encryptMessage(text, secretKey);

/*
      const receiverData = await getDoc(doc(db, "users", user.id)); // Get receiver's public keys
      const receiverIdentityKey = naclUtil.decodeBase64(receiverData.identityKey.publicKey);
      const receiverSignedPrekey = naclUtil.decodeBase64(receiverData.signedPrekey.publicKey);
      const receiverOneTimePrekey = naclUtil.decodeBase64(receiverData.oneTimePrekeys[0]);

      const privateKeys = await getPrivateKey(currentUser.id);  // Sender's private keys
      const sharedSecret = x3dhKeyExchange(
        { secretKey: naclUtil.decodeBase64(privateKeys.identityKeyPrivate) }, // Sender's identity keypair
        receiverIdentityKey,
        receiverSignedPrekey,
        receiverOneTimePrekey
      );

      const secretKey = sharedSecret.slice(0, 32); // Use first 32 bytes as encryption key
      const encryptedText = encryptMessage(text, secretKey); // Encrypt the message
*/



      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: encryptedText,  
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    } finally {
      setImg({
        file: null,
        url: "",
      });

      setText("");
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={message?.createAt}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              <span>{format(message.createdAt.toDate())}</span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
