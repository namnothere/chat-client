import SendIcon from '@mui/icons-material/Send';
import { socket } from '../socket';
import { InputAdornment, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useRef, useState } from 'react'
const Tagging = (
	props: any
) => {
	const [messages, setMessages] = useState<any[]>([])
	const [, setIsConnected] = useState(socket.connected);
	const [messageText, setMessageText] = useState('');
	const [join, setJoin] = useState(Boolean(false));
	const [name, setName] = useState('');
	const [startTime, setStartTime] = useState(0);
	const [allowEdit, setAllowEdit] = useState(false);
	let mediaRecorder: MediaRecorder | null;
	let recordedChunks: BlobPart[] = [];

	// const playerRef = useRef(null);
	const roomId = props.stream_id;

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

		}

		function onDisconnect() {
			setIsConnected(false);
		}

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
		};
	}, []);

	const sendMessage = (endTime: number) => {		
		socket.emit('createTagging', {
			author: name,
			content: messageText.trim(),
			stream_id: roomId,
			timestamp_from: startTime,
			timestamp_to: endTime + 5
		}, (message: any) => {
			setMessages([...messages, message]);
		});

		setMessageText('');
	}

	const userJoin = () => {
		socket.emit('findLatestTaggings', { stream_id: roomId }, (res: any) => {
			setMessages(res);
		})
	}

	function toTimeString(totalSeconds: number) {
		const totalMs = totalSeconds * 1000;
		const result = new Date(totalMs).toISOString().slice(11, 19);

		return result;
	}

	const editMessage = (message: any) => {
		socket.emit('updateTagging', message);
	}

	const delMessage = (id: number) => {
		socket.emit('removeTagging', {id: id});
	}

	const startRecording = () => {
    mediaRecorder = new MediaRecorder(props.videoRef.current.getInternalPlayer().srcObject);

    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    });

    mediaRecorder.start();
  };


	const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder = null;

      const blob = new Blob(recordedChunks, { type: 'audio/webm' });

			console.log(blob);

      recordedChunks = [];

      // Send `blob` to the backend
      // Make an API call to send the recorded audio to the backend
    } else {
      console.log('Recording not started');
    }
  };

	

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
										let timestamp = `${toTimeString(message.timestamp_from)} - ${toTimeString(message.timestamp_to)}`;
										return (
											<div className="tag-container" onMouseOver={() => {}}>
												<TextField id="standard-basic"
												// value={`[${timestamp}]: ${message.content}`}
												defaultValue={`[${timestamp}]: ${message.content}`}
												fullWidth={true}
												multiline={true}
												InputProps={{
													endAdornment: (
													<>
														<InputAdornment position="end">
															<EditIcon color="primary" onClick={() => {
																setAllowEdit(true);
																// message.content = message.content + " edited";
																// editMessage(message);
																// setMessages([...messages]);
															}}
															sx={{
																cursor: 'pointer',
															}}
															>
															</EditIcon>
														</InputAdornment>
														<InputAdornment position="end">
															<DeleteIcon color="primary" onClick={() => {
																delMessage(message.id);
																messages.splice(index, 1);
																setMessages([...messages]);
															}} 
															sx={{
																cursor: 'pointer',
															}}
															>
															</DeleteIcon>
														</InputAdornment>
													</>
													),
												}}
												inputProps={{
													readOnly: !allowEdit,
													style: { color: "white" },
												}}
												sx={{
													input: {
														color: 'white'
													},
													"& fieldset": { border: 'none' },
												}}
												onChange={(e: any) => {
 													message.content = e.target.value;
												}}
												onKeyDown={(e: any) => {
													if (e.key === 'Enter' && e.shiftKey) {
														message.content += "\n";
														// setAllowEdit(false);
													} else if (e.key === 'Enter') {
														setAllowEdit(false);
													}
												}}
												/>
											</div>
										);
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
											onClick={(e: any) => {
												sendMessage(e);
											}}
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
										if (e.target.value.trim().length == 1) setStartTime(props.videoRef.current.getCurrentTime());
										setMessageText(e.target.value);
									}}
									onKeyDown={(e: any) => {
										if (e.target.value.trim() == '') return;
										if (e.key === 'Enter') {
											let endTime = props.videoRef.current.getCurrentTime();
											sendMessage(endTime);
										}
									}}
								/>
							</div>
						</div>
						<div className="download" style={{
							textAlign: 'center', 
							top: '2vh',
							right: '2vh',
							position: 'fixed' }}>
							<button type='submit' onClick={
									(e: any) => {
										console.log("DOWNLOAD");
									}
								}>Download</button>
						</div>
						<button onClick={startRecording}>Start Recording</button>
						<button onClick={stopRecording}>Stop Recording</button>
					</div> : null
				}
			</div>
		</>
	)
}

export default Tagging;