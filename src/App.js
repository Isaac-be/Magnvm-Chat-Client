import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import styled from 'styled-components';
import io from 'socket.io-client';
import ImageMsg from './ImageMsg';

const Page = styled.div`
	display: flex;
	width: 100vw;
	height: 100vh;
`;

const SelectedUserForChat = styled.div`
	display: flex;
	width: 20%;
	padding: 30px 0px;
	align-items: center;
	justify-content: center;
	color: white;
	flex-direction: column;
	background-color: #3e455a;
`;

const ChatBox = styled.div`
	display: flex;
	width: 60%;
	padding: 30px 0px;
	align-items: center;
	color: white;
	flex-direction: column;
`;
const UsersList = styled.ul`
	display: flex;
	width: 20%;
	padding: 30px 0px;
	padding-inline-start: 0px;
	margin: 0px;
	list-style-type: none;
	justify-content: center;
	background-color: #3e455a;
	color: white;
	flex-direction: column;
	text-align: center;
	li {
		cursor: pointer;
		background-color: #1e1f22;
		margin-bottom: 10px;
		padding: 10px;
		font-weight: 200;
	}
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 500px;
	max-height: 500px;
	overflow: auto;
	width: 90%;
	border: 1px solid lightgray;
	border-radius: 10px;
	padding-bottom: 10px;
	margin-top: 25px;
`;

const TextArea = styled.textarea`
	width: 98%;
	height: 100px;
	border-radius: 10px;
	margin-top: 10px;
	padding-left: 10px;
	padding-top: 10px;
	font-size: 17px;
	background-color: transparent;
	border: 1px solid lightgray;
	outline: none;
	color: lightgray;
	letter-spacing: 1px;
	line-height: 20px;
	::placeholder {
		color: lightgray;
	}
`;

const Button = styled.button`
	background-color: pink;
	width: 100%;
	border: none;
	height: 50px;
	border-radius: 10px;
	color: #46516e;
	font-size: 17px;
`;

const Form = styled.form`
	width: 90%;
`;

const MyRow = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-end;
	margin-top: 10px;
`;

const MyMessage = styled.div`
	background-color: pink;
	color: #46516e;
	padding: 10px;
	margin-right: 5px;
	text-align: center;
	border-top-right-radius: 10%;
	border-bottom-right-radius: 10%;
`;

const PartnerRow = styled(MyRow)`
	justify-content: flex-start;
`;

const PartnerMessage = styled.div`
  background-color: transparent;
  color: lightgray;
  border: 1px solid lightgray;
  padding: 10px;
  margin-left: 5px;
  text-align: center;
  border-top-left-radius: 10%;
  const io = require("socket.io-client");
  const socket = io("https://api.example.com", {
    withCredentials: true,
    extraHeaders: {
      "token": "abcd"
    }
  });
  border-bottom-left-radius: 10%;
`;

const App = () => {
	const [name, setName] = useState('');
	const [userID, setUserID] = useState();
	const [socketId, setSocketId] = useState();
	const [myFollowings, setMyFollowings] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
	const [connectionUserChange, setConnectionUserChange] = useState(null);
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');
	const [updatedMessage, setUpdatedMessage] = useState(null);
	const [deletedMessage, setDeletedMessage] = useState(null);
	const [file, setFile] = useState(null);

	const socketRef = useRef();

	useEffect(() => {
		let token = prompt('Your access token');

		socketRef.current = io('http://localhost:3000', {
			withCredentials: true,
			extraHeaders: {
				authorization: token,
			},
		});

		socketRef.current.on('connectionSuccess', (data) => {
			const { _id, username, socketId, connectionUsers } = data;

			console.log('========== Connection Success ===============');
			console.log('Socket', socketRef);
			console.log(data);
			console.log('========== Connection Success ===============');

			setUserID(_id);
			setSocketId(socketId);
			setName(username);
			setMyFollowings(connectionUsers);

			console.log('Socket', socketRef);
		});

		socketRef.current.on('Update Connection Status', (connectionUserChange) => {
			console.log('========== User connection Status Changed ===============');
			console.log(connectionUserChange);
			console.log('========== User connection Status Changed ===============');
			setConnectionUserChange(connectionUserChange);
		});

		socketRef.current.on('Joined ChatRoom', (data) => {
			const { chatRoomId, messages } = data;
			console.log('========== Joined ChatRoom ===============');
			console.log(data);
			setSelectedChatRoomId(chatRoomId);
			setMessages(messages);
			console.log('========== Joined ChatRoom ===============');
		});

		socketRef.current.on('message', (message) => {
			console.log('message received:-', message);
			receivedMessage(message);
		});

		socketRef.current.on('Message Updated', (updatedMsg) => {
			const { _id, chatRoom } = updatedMsg;
			console.log('Some updated message received so saving in DB', updatedMsg);
			setUpdatedMessage(updatedMsg);
		});

		socketRef.current.on('Message Deleted', (deletedMsgData) => {
			const { _id, chatRoom } = deletedMsgData;
			console.log(`Some message deleted`, deletedMsgData);
			setDeletedMessage(deletedMsgData);
		});
	}, []);

	function receivedMessage(message) {
		setMessages((oldMsgs) => [...oldMsgs, message]);
	}

	function sendMessage(e) {
		e.preventDefault();

		if (!selectedChatRoomId) {
			alert('Message not sent as no chatRoom id is provided');
			return;
		}

		let messageObject;

		if (file) {
			messageObject = {
				content: file,
				id: userID,
				type: 'file',
				mimeType: file.mimeType,
				fileName: file.name,
			};
		} else {
			if (!message) {
				return;
			}
			messageObject = {
				content: message,
				receiver: selectedUser._id,
				chatRoom: selectedChatRoomId,
			};
		}

		setMessage('');
		setFile(null);
		socketRef.current.emit('send message', messageObject);
	}

	function handleChange(e) {
		setMessage(e.target.value);
	}

	function handleFile(e) {
		let file = e.target.files[0];
		if (!file) return;
		setMessage(file.name);
		setFile(file);
	}

	const handleSelectedUser = (user) => {
		setSelectedUser(user);
		socketRef.current.emit('Join ChatRoom', {
			friendId: user._id,
		});
	};

	const updateMessage = (messageId, messageStatus) => {
		console.log(messageStatus);
		socketRef.current.emit('update message', {
			messageId,
			status: messageStatus,
		});
	};

	const deleteMessage = (msgId) => {
		socketRef.current.emit('Delete Message', msgId);
	};

	useEffect(() => {
		if (connectionUserChange) {
			const { _id, status } = connectionUserChange;
			let updatedFollowings = myFollowings.filter((followee) => {
				console.log(followee);
				if (followee._id === _id) {
					followee.online = status;
				}

				return followee;
			});

			console.log(updatedFollowings);

			setMyFollowings(updatedFollowings);
			setConnectionUserChange(null);
		}
	}, [connectionUserChange]);

	useEffect(() => {
		if (updatedMessage) {
			const { _id, chatRoom } = updatedMessage;
			if (chatRoom == selectedChatRoomId) {
				console.log('Selected chatRoomId & updatedMessage chatRoom matched');
				let updatedMessagesList = messages.filter((msg) => {
					if (msg._id == _id) {
						msg.seenAt = updatedMessage.seenAt;
					}
					return msg;
				});
				setMessages([...updatedMessagesList]);
			}

			setUpdatedMessage(null);
		}
	}, [updatedMessage]);

	useEffect(() => {
		if (deletedMessage) {
			console.log('Deleted message data is ', deletedMessage);
			const { _id, chatRoom } = deletedMessage;

			if (chatRoom === selectedChatRoomId) {
				let updatedMessages = messages.filter((msg) => msg._id !== _id);
				setMessages(updatedMessages);
			}
			setDeletedMessage(null);
		}
	}, [deletedMessage]);

	return (
		<Page>
			<SelectedUserForChat>
				<h3>Selected ChatRoom</h3>
				{selectedUser && selectedChatRoomId && (
					<div>
						<h4>
							<small>RoomId :-</small> {selectedChatRoomId}
						</h4>
						<h4>
							<small>UserID :-</small> {selectedUser._id}
						</h4>
						<h4>
							<small>Name :-</small> {selectedUser.username}
						</h4>
					</div>
				)}
			</SelectedUserForChat>
			<ChatBox>
				<div>
					<span>Name:- {name}</span>
					<br />
					<span>UserId:- {userID}</span>
					<br />
					<span>SocketId:- {socketId}</span>
					<br />
				</div>
				<Container>
					{messages.map((message, index) => {
						if (message.sender === userID || message.sender._id === userID) {
							return (
								<MyRow key={index}>
									{message.type === 'file' ? (
										<ImageMsg message={message} />
									) : (
										<MyMessage>
											<span className='sender'>Me</span>
											<span>{'>>'} </span>
											{message.content}
											<span style={{ marginLeft: '10px', color: 'green' }}>
												{message.seenAt ? 'seen' : 'not seen yet'}
											</span>
											<button
												className='delete-btn'
												onClick={() => deleteMessage(message._id)}
											>
												Delete
											</button>
										</MyMessage>
									)}
								</MyRow>
							);
						}
						return (
							<PartnerRow key={index}>
								{message.type === 'file' ? (
									<ImageMsg message={message} />
								) : (
									<PartnerMessage>
										<span className='sender'>{message.sender.username}</span>
										<span>{'>>'} </span>
										{message.content}
										{message.seenAt ? (
											<button
												onClick={() => updateMessage(message._id, false)}
												className='change-status'
											>
												Mark As Unread
											</button>
										) : (
											<button
												onClick={() => updateMessage(message._id, true)}
												className='change-status'
											>
												Mark As Read
											</button>
										)}
									</PartnerMessage>
								)}
							</PartnerRow>
						);
					})}
				</Container>
				<Form onSubmit={sendMessage}>
					<TextArea
						value={message}
						onChange={handleChange}
						placeholder='Say something...'
					/>
					<input type='file' onChange={handleFile} accept='image/*' />
					<Button>Send</Button>
				</Form>
			</ChatBox>
			<UsersList>
				<h3>Users I am Following or NonFollowings with whom chatRooms exist</h3>
				{myFollowings.map((user) => (
					<li key={user._id} onClick={() => handleSelectedUser(user)}>
						{user.username}
						{user.online ? (
							<span
								style={{
									marginLeft: '10px',
									color: 'green',
									fontWeight: '400',
								}}
							>
								online
							</span>
						) : (
							<span
								style={{ marginLeft: '10px', color: 'red', fontWeight: '400' }}
							>
								offline
							</span>
						)}
					</li>
				))}
			</UsersList>
		</Page>
	);
};

export default App;
