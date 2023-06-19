import SendIcon from '@mui/icons-material/Send';
import { socket } from '../socket';
import { Box, InputAdornment, TextField, Tooltip } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react'

function Main() {
    const [messages, setMessages] = useState<any[]>([])
	const [, setIsConnected] = useState(socket.connected);
	const [messageText, setMessageText] = useState('');
	const [join, setJoin] = useState(Boolean(false));
	const [typingDisplay, setTypingDisplay] = useState('');
	const [name, setName] = useState('');
	// const [newUser_join, setNewUser_join] = useState('');
	const [userList, setUserList] = useState<number>(0);
	const [searchResults, setSearchResults] = useState<any[]>([]);

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
	
			socket.on('typing', ({ name, isTyping }) => {
				if (isTyping) {
					setTypingDisplay(`${name} is typing`);
				} else {
					setTypingDisplay('');
				}
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
		socket.emit('typing', { isTyping: false, to: 'main' }, () => {

		});
		socket.emit('createMessage', {
			author: name,
			content: messageText.trim(),
			to: 'main'
		}, (_message: any) => {

		});

		setMessageText('');
	}

	const userJoin = () => {
		socket.emit('join', { name: name, to: 'main' }, () => {
		})
		socket.emit('findLatest', {room: 'main'}, (res: any) => {
			setMessages(res);
		})
	}
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US');
	}

	const emitTyping = () => {
		socket.emit('typing', { isTyping: true }, (res: { name: string; isTyping: boolean; to: string }) => {
			setTypingDisplay(`${res.name} is typing`);
		});
	}

	const emitSearch = (input: string) => {
		socket.emit('search', {query: input, to: 'main'}, (res: any) => {
			setSearchResults(res);
		});
	}

	const editMessage = (message: any) => {
		socket.emit('updateMessage', message);
	}

	const delMessage = (id: number) => {
		socket.emit('removeMessage', {id: id, to: 'main'});
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
						<TextField label="Search"
							InputLabelProps={{ shrink: true }}
							InputProps={{
								endAdornment: (
								<InputAdornment position="end">
									<SearchIcon onClick={(e: any) => console.log(e)}>
									</SearchIcon>
								</InputAdornment>
								),
								disableUnderline: true,
								sx: { fontSize: 15, mr: 1, color: 'white' },
							}}
							onKeyDown={(e: any) => {
								if (e.target.value.trim() == '') return;
								if (e.key === 'Enter') {
									console.log("on key down", e);
									emitSearch(e.target.value.trim())
								}
							}}
						/>

						{
							searchResults.length > 0 ?
							<Box
								sx={{
									display: 'block'
								}}>
								{
									searchResults.map((msg: any) => {
										return <div key={msg.id}>
											{msg.author}: {msg.content}
										</div>
									})
								}
							</Box> : null
						}

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
										}
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

							{
								typingDisplay !== '' ?
								<div className="typing">
									{typingDisplay}
								</div>
								: null
							}

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
										emitTyping();
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

export default Main;