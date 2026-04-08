# MoneroSwap.cloud

An anonymous, non-custodial cryptocurrency exchange platform with a focus on **Monero (XMR)**. Swap your assets instantly with no KYC and total privacy.

## Features

- **Anonymous Exchange**: No registration or personal data required.
- **No KYC**: We never ask for identity documents.
- **Privacy by Design**: No logs, no IP tracking, and no third-party analytics.
- **Tor Network Support**: Accessible via a dedicated `.onion` hidden service for maximum anonymity.
- **Powered by ChangeNOW**: Leverages the ChangeNOW.io liquidity infrastructure.

## Tor Access

For maximum privacy, use the following Tor Hidden Service address:
`http://hhnaholwijsz5puw3gzvrhipzmcpiyinmjw725rqymq7sfj7pfyetryd.onion`

## Deployment

The website is a single-file application (`index.html`). To deploy:

1.  Upload `index.html` to any web server (Apache, Nginx, or even static hosting).
2.  Configure your web server to serve the file.
3.  (Optional) Set up a Tor Hidden Service pointing to your server's port 80.

## Configuration

In `index.html`, you should configure the following constants in the `CONFIG` object:

```javascript
const CONFIG = {
    apiKey: '<YOUR_CHANGENOW_API_KEY>',
    refCode: '<YOUR_CHANGENOW_REF_CODE>',
    apiEndpoint: '/api', // Proxy recommendation
    changenowBaseUrl: 'https://api.changenow.io'
};
```

**Security Note**: It is highly recommended to use a server-side proxy to hide your API Key from the client-side.

## License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for more details.

---
*Developed for privacy enthusiasts.*
