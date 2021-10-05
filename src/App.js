import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import styled from 'styled-components';
import io from 'socket.io-client';
import ImageMsg from './ImageMsg';

const Page = styled.div`
	display: flex;
	width: 70vw;
	height: 100vh;
`;

const SelectedUserForChat = styled.div`
	display: flex;
	width: 25%;
	padding: 30px 0px;
	align-items: center;
	justify-content: center;
	color: white;
	flex-direction: column;
	background-color: #3e455a;
`;

const ChatBox = styled.div`
	display: flex;
	width: 50%;
	padding: 30px 0px;
	align-items: center;
	color: white;
	flex-direction: column;
`;
const UsersList = styled.ul`
	display: flex;
	width: 25%;
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
		background-color: #a3acc9;
		margin-bottom: 10px;
		padding: 10px;
	}
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 500px;
	max-height: 500px;
	overflow: auto;
	width: 400px;
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
	width: 400px;
`;

const MyRow = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-end;
	margin-top: 10px;
`;

const MyMessage = styled.div`
	width: 45%;
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
  width: 45%;
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
	const [onlineUsers, setOnlineUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');
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
		//

		// socketRef.current.on('connect', () => {
		// 	setUserID(socketRef.current.id);
		// 	console.log('Socket', socketRef);
		// });

		socketRef.current.on('connectionSuccess', (data) => {
			const { _id, username, socketId } = data;

			console.log('========== Connection Success ===============');
			console.log('Socket', socketRef);
			console.log('========== Connection Success ===============');

			setUserID(_id);
			setSocketId(socketId);
			setName(username);

			console.log('Socket', socketRef);
		});

		socketRef.current.on('user connected', (data) => {
			console.log('========== User connected ===============');
			console.log(data);
			console.log('========== User connected ===============');
			setOnlineUsers(data.onlineUsers);
		});

		socketRef.current.on('Joined ChatRoom', (data) => {
			console.log('========== Joined ChatRoom ===============');
			console.log(data);
			console.log('========== Joined ChatRoom ===============');
		});

		socketRef.current.on('message', (message) => {
			console.log('message received:-', message);
			receivedMessage(message);
		});
	}, []);

	function receivedMessage(message) {
		setMessages((oldMsgs) => [...oldMsgs, message]);
	}

	function sendMessage(e) {
		e.preventDefault();

		let chatRoom = prompt('Your chatRoom Id');

		if (!chatRoom) {
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
				chatRoom,
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
			status: messageStatus ? false : true,
		});
	};

	return (
		<Page>
			<SelectedUserForChat>
				<h3>Selected ChatRoom User</h3>
				{selectedUser && (
					<div>
						<h4>{selectedUser._id}</h4>
						<h4>{selectedUser.name}</h4>
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
						if (message.sender === userID) {
							return (
								<MyRow key={index}>
									{message.type === 'file' ? (
										<ImageMsg message={message} />
									) : (
										<MyMessage>{message.content}</MyMessage>
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
										{message.content}
										<button
											onClick={() => updateMessage(message._id, null)}
											style={{ marginLeft: '10px', color: 'green' }}
										>
											Mark As Read
										</button>
										<button
											onClick={() => updateMessage(message._id, 123)}
											style={{ marginLeft: '10px', color: 'green' }}
										>
											Mark As Unread
										</button>
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
				<h3>Online Users</h3>
				{Object.values(onlineUsers)
					.filter((u) => u._id !== userID)
					.map((user) => (
						<li key={user._id} onClick={() => handleSelectedUser(user)}>
							{user.name}
						</li>
					))}
			</UsersList>
		</Page>
	);
};

export default App;
