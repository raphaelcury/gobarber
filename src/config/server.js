export const serverParams = {
  protocol: process.env.APP_PROTOCOL,
  url: process.env.APP_URL,
  port: process.env.APP_PORT,
};

export const serverUrl = `${serverParams.protocol}://${serverParams.url}:${serverParams.port}`;
