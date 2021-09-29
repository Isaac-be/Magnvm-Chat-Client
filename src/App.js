import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import ImageMsg from './ImageMsg';

const Page = styled.div`
	display: flex;
	height: 100vh;
	width: 100%;
	padding: 30px 0px;
	align-items: center;
	background-color: #46516e;
	color: white;
	flex-direction: column;
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
			const { uId, username, socketId } = data;

			console.log('Socket', socketRef);

			setUserID(uId);
			setSocketId(socketId);
			setName(username);

			console.log('Socket', socketRef);
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

		let receiverId = prompt('Receiver Id');

		let messageObject;

		if (file) {
			messageObject = {
				body: file,
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
				body: message,
				id: userID,
				receiverId,
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

	return (
		<Page>
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
					if (message.id === userID) {
						return (
							<MyRow key={index}>
								{message.type === 'file' ? (
									<ImageMsg message={message} />
								) : (
									<MyMessage>{message.body}</MyMessage>
								)}
							</MyRow>
						);
					}
					return (
						<PartnerRow key={index}>
							{message.type === 'file' ? (
								<ImageMsg message={message} />
							) : (
								<PartnerMessage>{message.body}</PartnerMessage>
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
		</Page>
	);
};

export default App;
