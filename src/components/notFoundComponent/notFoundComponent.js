import * as React from "react";
import styled from "styled-components";
import '../CSS/style.css';

function NotFoundPage() {
  return (
    <ErrorPageContainer>
      <ErrorImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/67561e2bd7a4e0f8b4ccc5f1b9d08ebe63f9a3fda99782c297f273090d8ffc1f?apiKey=f933b1b419864e2493a2da58c5eeea0a&" alt="Error illustration" />
      <ErrorTitle>Page Not Found</ErrorTitle>
      <ErrorDescription>
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </ErrorDescription>
      <ReturnLink href="/main">Return to homepage.</ReturnLink>
    </ErrorPageContainer>
  );
}

const ErrorPageContainer = styled.main`
  display: flex;
  height: 80vh;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 64px 48px;
  text-align: center;
  background-color: var(--Background-bg-secondary, #f3f5f6);

  @media (max-width: 991px) {
    padding: 0 20px;
  }
`;

const ErrorImage = styled.img`
  width: 100%;
  max-width: 658px;
  aspect-ratio: 3.57;
  object-fit: contain;
  object-position: center;

  @media (max-width: 991px) {
    margin-top: 40px;
  }
`;

const ErrorTitle = styled.h1`
  margin-top: 40px;
  color: var(--Text-txt-primary, #000);
  font: 700 48px/120% Inter, sans-serif;
  letter-spacing: 0.25px;

  @media (max-width: 991px) {
    font-size: 40px;
  }
`;

const ErrorDescription = styled.p`
  margin-top: 33px;
  color: var(--Text-txt-secondary, rgba(60, 60, 67, 0.85));
  font: 400 20px/140% Inter, sans-serif;
`;

const ReturnLink = styled.a`
  text-decoration: none;
  font-size: 24px;
  color: #0096FF;
  border-bottom: 1px dashed #89CFF0;
  border-radius: 2px;
    `;
export default NotFoundPage;