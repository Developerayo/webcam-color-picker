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

const CaptureButton = styled.button`
  background-color: #0070f3;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 1rem;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #005fd3;
  }
`;

const ColorPreview = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
`;

const ColorBox = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  margin-right: 0.5rem;
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
        <CaptureButton onClick={capture}>Capture</CaptureButton>
        {hexColor && (
          <ColorPreview>
            <ColorBox color={hexColor} />
            <p>Detected color: {hexColor}</p>
          </ColorPreview>
        )}
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
