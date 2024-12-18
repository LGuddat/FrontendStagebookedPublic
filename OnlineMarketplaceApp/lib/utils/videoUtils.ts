export const getYouTubeVideoID = (url: string | null | undefined) => {
  if (!url) return null;
  
  const regExp = /(?:youtube\.com\/(?:[^\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

export const getYouTubeThumbnail = (url: string | null | undefined) => {
  if (!url) return null;
  
  const videoID = getYouTubeVideoID(url);
  return videoID ? `https://img.youtube.com/vi/${videoID}/0.jpg` : null;
};

export const getYouTubeEmbedUrl = (url: string): string | undefined => {
  const match = url.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : undefined;
}; 