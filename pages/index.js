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
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
`;

const ColorBox = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  margin: 0.5rem;
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
  const [hexColors, setHexColors] = useState([]);

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const colors = await getColorsFromImage(imageSrc);
    setHexColors(colors);
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
        {hexColors.length > 0 && (
          <ColorPreview>
            {hexColors.map((color, index) => (
              <ColorBox key={index} color={color} />
            ))}
          </ColorPreview>
        )}
      </Container>
    </>
  );
}

async function getColorsFromImage(imageSrc) {
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

  const sampleSize = 10;
  const halfSampleSize = Math.floor(sampleSize / 2);
  const centerX = Math.floor(img.width / 2);
  const centerY = Math.floor(img.height / 2);

  const positions = [
    { x: centerX, y: centerY },
    { x: centerX + halfSampleSize, y: centerY - halfSampleSize },
    { x: centerX - halfSampleSize, y: centerY + halfSampleSize },
    { x: centerX + halfSampleSize, y: centerY + halfSampleSize },
  ];

  const colors = await Promise.all(positions.map(async (pos) => getColorFromImageData(ctx, pos, sampleSize)));

  return colors;
}

async function getColorFromImageData(ctx, position, sampleSize) {
  const imageData = ctx.getImageData(position.x, position.y, sampleSize, sampleSize).data;

  let r = 0;
  let g = 0;
  let b = 0;
  const totalPixels = Math.floor(imageData.length / 4);

  for (let i = 0; i < imageData.length; i += 4) {
    r += imageData[i];
    g += imageData[i + 1];
    b += imageData[i + 2];
  }

  r = Math.floor(r / totalPixels);
  g = Math.floor(g / totalPixels);
  b = Math.floor(b / totalPixels);

  return rgbToHex(r, g, b);
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
