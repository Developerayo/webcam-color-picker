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
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;
  justify-items: center;
  margin-top: 1rem;
`;

const ColorBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  animation: fadeIn 1s forwards;
  &:nth-of-type(1) {
    animation-delay: 0.2s;
  }
  &:nth-of-type(2) {
    animation-delay: 0.4s;
  }
  &:nth-of-type(3) {
    animation-delay: 0.6s;
  }
  &:nth-of-type(4) {
    animation-delay: 0.8s;
  }
  &:nth-of-type(5) {
    animation-delay: 1s;
  }
`;

const ColorCircle = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  margin-bottom: 0.5rem;
`;

const CopyButton = styled.button`
  background-color: transparent;
  border: none;
  color: #0070f3;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: 0.5rem;
  &:hover {
    text-decoration: underline;
  }
`;

const GlobalStyle = css`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
`;

const videoConstraints = {
  width: 540,
  height: 280,
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
            <ColorBox key={index}>
              <ColorCircle color={color.hex} />
              <p>
                {color.hex}
                <CopyButton onClick={() => handleCopyClick(color, "hex")}>
                  Copy
                </CopyButton>
              </p>
              <p>
                {`RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`}
                <CopyButton onClick={() => handleCopyClick(color, "rgb")}>
                  Copy
                </CopyButton>
              </p>
            </ColorBox>
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
  const stepX = Math.floor(img.width / 6);
  const stepY = Math.floor(img.height / 6);

  const positions = [
    { x: stepX, y: stepY },
    { x: stepX * 2, y: stepY * 4 },
    { x: stepX * 4, y: stepY * 4 },
    { x: stepX * 5, y: stepY },
    { x: stepX * 3, y: stepY * 2 },
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

  const hex = rgbToHex(r, g, b);

  return {
    hex: hex,
    rgb: { r, g, b },
  };
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    () => {
      console.log(`Copied: ${text}`);
    },
    (err) => {
      console.error("Could not copy text: ", err);
    }
  );
}

function handleCopyClick(color, type) {
  if (type === "hex") {
    copyToClipboard(color.hex);
  } else if (type === "rgb") {
    const rgbText = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
    copyToClipboard(rgbText);
  }
}


function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
