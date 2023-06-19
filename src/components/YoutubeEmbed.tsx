import Tagging from "./Tagging";
import ReactPlayer from "react-player";
import { useRef } from "react";
import { useParams } from "react-router-dom";

const YoutubeEmbed = () => {
  let params = useParams();
  const inputRef = useRef(null); 
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactPlayer
        url={`https://www.youtube.com/embed/${params.stream_id}`}
        pip={true}
        controls={true}
        ref={inputRef}
      />
      <br></br>
      <Tagging videoRef={inputRef} stream_id={params.stream_id} />
    </div>
  );
}

export default YoutubeEmbed;