const setupUrlShortener = require("./setupUrlShortener");
async function start() {
  const { urlShortener } = await setupUrlShortener();
  console.log("4 urlShortener michal: ", urlShortener);
  const urls = [
    "http://localhost:8081/triggers/ack?ackCode=P2QtDUt7H&user=developers%40tetrascience.com&alert=5dc5d4f941fc83e9e5f40ed7&method=text",
    "http://dashboard.ci.dev.tetrascience.com/dashboard#/dashboard?filter=deviceName&page=1",
    "https://github.com/tetrascience/ts-cloud",
    "http://localhost:8081/triggers/ack?ackCode=P2QtDUt7H&user=developers%40tetrascience.com&alert=5dc5d4f941fc83e9e5f40ed7&method=text",
    "https://dashboard.ci.dev.tetrascience.com/dashboard#/dashboard?filter=deviceName&page=1"
  ];
  // console.log('12  michal: ', await urlShortener.shorten(urls[0], '/some/short/route'));
  urls.forEach(async url => {
    console.log("14  michal: ", await urlShortener.shorten(url));
  });
  // console.log('16 await michal: ', await urlShortener.remove('https://tetrascience.com/jk5ItNQrK6w0'));
}

start();
