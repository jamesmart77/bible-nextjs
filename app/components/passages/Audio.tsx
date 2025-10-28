"use client";

import React, { useState } from "react";
import { Fade } from "react-awesome-reveal";
import { IconButton, Text } from "@chakra-ui/react";
import { RiVolumeDownLine } from "react-icons/ri";

export default function Audio() {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlecClick = () => {
    alert("Audio Bible listening coming soon!");
  };

  return (
    <>
      <IconButton
        ml={2}
        rounded="full"
        variant="ghost"
        size="md"
        onClick={handlecClick}
        onKeyDown={() => setIsExpanded(!isExpanded)}
        aria-label="Listen to Bible passage audio"
      >
        <RiVolumeDownLine />
      </IconButton>
      {isExpanded && (
        <Fade duration={500} direction="up">
          <Text>Audio Bible listening coming soon!</Text>
          {/* <div className="audio-player-wrapper">
                        <ReactAudioPlayer
                        className="passage-audio"
                        src={`https://audio.esv.org/david-cochran-heath/mq/${passageRef}.mp3`}
                        controls
                        />
                        </div> */}
        </Fade>
      )}
    </>
  );
}
