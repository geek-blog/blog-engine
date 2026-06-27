import { getTextContent, isVideoUrl, VideoEmbed } from './MarkdownVideoLink';

function MarkdownVideoParagraph({ children }) {
  const text = getTextContent(children).trim();

  if (isVideoUrl(text)) {
    return <VideoEmbed href={text} />;
  }

  return <p>{children}</p>;
}

export default MarkdownVideoParagraph;
