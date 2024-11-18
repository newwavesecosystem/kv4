const DEFAULT_MAX_RETRIES = 10;
const DEFAULT_RETRY_TIMEOUT = 500;

const playAndRetry = async (mediaElement:any, isPresenter:boolean=true, maxRetries = DEFAULT_MAX_RETRIES) => {
  let attempt = 0;
  let played = false;

  console.log("trying to playAndRetry");
  const playElement = () => new Promise((resolve, reject) => {
    console.log("doing playAndRetry, attempt:",attempt);
    setTimeout(() => {
      if(!isPresenter){
        mediaElement.muted=false;
      }
      mediaElement.play().then(resolve).catch(reject);
    }, DEFAULT_RETRY_TIMEOUT);
  });

  while (!played && attempt < maxRetries && mediaElement.paused) {
    try {
      await playElement();
      played = true;
      return played;
    } catch (error) {
      attempt += 1;
    }
  }

  console.log("trying to playAndRetry:",played);
  console.log("trying to playAndRetry mediaElement:",mediaElement.paused);

  return played || mediaElement.paused;
};

export default playAndRetry;
