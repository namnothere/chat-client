import SendIcon from '@mui/icons-material/Send';
import { socket } from '../socket';
import { Box, InputAdornment, TextField, Tooltip } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react'

function LiveChat() {
    const [messages, setMessages] = useState<any[]>([])
	const [, setIsConnected] = useState(socket.connected);
	const [messageText, setMessageText] = useState('');
	const [join, setJoin] = useState(Boolean(false));
	const [name, setName] = useState('');
	// const [newUser_join, setNewUser_join] = useState('');
	const [userList, setUserList] = useState<number>(0);

	useEffect(() => {
		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);

		try {
			var name = localStorage.getItem('name');
			if (name) {
				setName(name);
				setJoin(true);
				userJoin();
				setMessages([]);
			}
		} catch (e) {
			setName('');
		}

		function onConnect() {
			setIsConnected(true);
	
			socket.on('newMessage', (messages) => {
				setMessages(messages);
			})
	
			socket.on('newUser_join', (usersTotal: number) => {
				setUserList(usersTotal);
			})
		}

		function onDisconnect() {
			setIsConnected(false);
		}

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
		};
	}, []);

	const sendMessage = () => {
		socket.emit('typing', { isTyping: false, to: 'stream' }, () => {

		});
		socket.emit('createMessage', {
			author: name,
			content: messageText.trim(),
			to: 'stream'
		}, (_message: any) => {

		});

		setMessageText('');
	}

	const userJoin = () => {
		socket.emit('join', { name: name, to: 'stream' }, () => {
		})
		socket.emit('findLatest', { room: 'stream' }, (res: any) => {
            console.log(res);
			setMessages(res);
		})
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US');
	}

	const editMessage = (message: any) => {
		socket.emit('updateMessage', message);
	}

	const delMessage = (id: number) => {
		socket.emit('removeMessage', {id: id, to: 'stream'});
	}

	return (
		<>
			<div>
				{
					!join ? <div className="new-user">
						<form onSubmit={
							(e: any) => {
								e.preventDefault();
							}
						}>
							<input type="text" placeholder="Enter your name"
							value={name}
							onChange={(e: any) => {
								setName(e.target.value);
							}}/>
							<button type='submit' onClick={
								(e: any) => {
									localStorage.setItem('name', name);
									e.preventDefault();
									setJoin(true);
									userJoin();
								}
							}>Join</button>
						</form>
					</div>
					: null
				}
				{
					join ?		
					<div className="chat">
						<Box sx={{ display: 'flex', alignItems: 'flex-end', color: 'white' }}>
							<TextField id="input-with-sx"
								variant="standard"
								value={userList >= 2 ? `${userList} users online` : `${userList} user online`}
								InputProps={{
									disableUnderline: true,
									disabled: true,
									startAdornment: (
										<InputAdornment position="start">
										<CircleIcon sx={{ color: 'green', mr: 1, my: 0.5, fontSize: 15 }} />
										</InputAdornment>
									),
									sx:{
										input: {
											color: 'white'
										},
                                        "&.Mui-disabled": {
                                            background: "#eaeaea",
                                            color: "#ffffff"
                                        },
									}
								}}
								InputLabelProps={{ shrink: false, style: { color: 'white'}, sx: { color: 'white', fontSize: 12 } }}
								/>
						</Box>
						<div className="chat-container">
							<div className="messages-container">
								{ messages.map((message: any, index: number) => {
									let textStyle = {
										display: 'flex',
										alignItems: 'center',
										fontSize: 16,
										fontWeight: 'normal',
									};
									if (message.author === name) {
										textStyle.fontWeight = 'bold';
									}
									try {
										return (<Tooltip title={formatDate(message.created_at)} placement="bottom-start">
											<div style={textStyle} key={index}>[{message.author}]: {message.content}
												{
													message.author === name ?
													<EditIcon onClick={() => {
														let editMsg = message;
														editMsg.content = message.content + "edited";
														editMessage(editMsg);
													}} >
													</EditIcon> : null
												}

												{
													message.author === name ?
													<DeleteIcon onClick={() => {
														delMessage(message.id);
													}} >
													</DeleteIcon> : null
												}
											</div>
										</Tooltip>)
									} catch (err: any) {
										console.log("err", err.message);
										return null;
									}
								})}
							</div>
							<br></br>

							<div className="message-input">
								<TextField
									fullWidth={true}
									InputLabelProps={{ shrink: true, style: { color: 'white' } }}
									label={name}
									id="standard-size-normal"
									value={messageText}
									variant="standard"
									InputProps={{
										endAdornment: (
										<InputAdornment position="end">
											<SendIcon color="primary"
											sx={{
												cursor: 'pointer'
											}}
											onClick={sendMessage}
											/>
										</InputAdornment>
										),
									}}
									sx={{
										input: {
											color: 'white'
										}
									}}
									onInput={(e: any) => {
										setMessageText(e.target.value);
									}}
									onKeyDown={(e: any) => {
										if (e.target.value.trim() == '') return;
										if (e.key === 'Enter') {
											sendMessage();
										}
									}}
									/>
							</div>
						</div>
					</div> : null
				}
			</div>
		</>
	)
}

export default LiveChat;