import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Global, css } from "@emotion/react";
import styled from "@emotion/styled";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const GlobalStyle = css`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

export default function Home() {
  const webcamRef = useRef(null);
  const [hexColor, setHexColor] = useState(null);

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const color = await getColorFromImage(imageSrc);
    setHexColor(color);
  };

  return (
    <>
      <Global styles={GlobalStyle} />
      <Container>
        <Webcam
          audio={false}
          height={720}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={1280}
          videoConstraints={videoConstraints}
        />
        <button onClick={capture}>Capture</button>
        {hexColor && <p>Detected color: {hexColor}</p>}
      </Container>
    </>
  );
}

async function getColorFromImage(imageSrc) {
  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);

  const centerPixelData = ctx.getImageData(
    Math.floor(img.width / 2),
    Math.floor(img.height / 2),
    1,
    1
  ).data;
  return rgbToHex(centerPixelData[0], centerPixelData[1], centerPixelData[2]);
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}
