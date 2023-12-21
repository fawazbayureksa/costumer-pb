## Google & Facebook Login SSO

Google:
Open https://console.cloud.google.com/
Create new project or use existing project. Follow this for more information.
Go to the Credentials page.
Click Create credentials > OAuth client ID.
Select the Web application application type
Name your OAuth 2.0 client and click Create
Under Authorised redirect URIs, click Add URI. Type the frontend domain (for ex: http://localhost:3000)
Click Create.
On the list of OAuth 2.0 Client IDs, find the ID you just added and click the copy logo.
Input copied clients id on React .env in REACT_APP_GOOGLE_CLIENT_ID

Facebook:
Open https://developers.facebook.com/apps/
Create new project or use existing project. Follow this for more information.
Find the App ID and copy
Input copied app id on React .env in REACT_APP_FACEBOOK_APP_ID

## Feature - 13 April 2021
- Setting in .env. Change the value to true or false.
- To use, use JSON.parse(process.env.{key})
- Marketplace Feature `key: REACT_APP_FEATURE_MARKETPLACE`
    - AppRoute.js ECommerceRoute
    - Websocket.js getMasterData
    - widgets/Cart.js getCounter
    - AccountSettings.js and widgets/Login.js:
        - ACCOUNT_SETTINGS_INBOX
        - ACCOUNT_SETTINGS_ADDRESS
        - ACCOUNT_SETTINGS_MY_ORDERS
        - ACCOUNT_SETTINGS_MY_ORDERS_DETAIL
        - ACCOUNT_SETTINGS_MY_PAYMENT_DETAIL
        - ACCOUNT_SETTINGS_WISHLIST
        - ACCOUNT_SETTINGS_MY_VOUCHERS
- FORUM Feature `key: REACT_APP_FEATURE_FORUM`
    - AppRoute.js GeneralRoute
    - forum/Forum.js :
        - FORUM_MY
        - FORUM_DETAIL_THREAD
        - FORUM_CREATE
        - FORUM_EDIT
- WEBINAR Feature `key: REACT_APP_FEATURE_WEBINAR`
    - AppRoute.js GeneralRoute
    - webinar/Dashboard.js :
        - WEBINAR_DASHBOARD
        - WEBINAR_LIST_EVENT
        - WEBINAR_LIST_SPEAKER
        - WEBINAR_DETAIL_EVENT
        - WEBINAR_DETAIL_SPEAKER
        - WEBINAR_CHECKOUT_PAYMENT

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
