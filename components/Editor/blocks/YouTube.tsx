const embedIdRegex =
  /(?:https?:\/\/)?(?:www\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\/?\?v=|\/embed\/|\/)([^\s&]+)/;

export function YouTube({ link }: { link: string }) {
  const embedId = link.match(embedIdRegex)![1];
  return (
    <iframe
      title="youtube"
      width="560"
      height="315"
      src={`https://www.youtube.com/embed/${embedId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
