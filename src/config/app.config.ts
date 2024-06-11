export default () => ({
    appName: process.env.APP_NAME || 'AIC API',
    port: parseInt(process.env.PORT, 10) || 3050,
});
