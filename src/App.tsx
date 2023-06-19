import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from './components/Main'
import YoutubeEmbed from './components/YoutubeEmbed';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Main />} />
				<Route path="/tagging/:stream_id" element={<YoutubeEmbed />} />
			</Routes>
		</BrowserRouter>
	);
}

// function Tagging(stream_id: string) {
// 	return YoutubeEmbed('48h57PspBec');
// }

export default App