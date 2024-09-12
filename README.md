# FLUX.1-dev - Image Generation API

This repository contains a Node.js application that interacts with the Hugging Face API to generate images based on a text description. It uses the Express framework to create a RESTful API and allows users to submit text prompts that generate images asynchronously.

## Features

- Submit text prompts to generate images.
- Job-based approach for managing multiple image generation requests.
- Job auto-expiry after 90 seconds.
- Randomized delays to simulate asynchronous operations.

## Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/en/) (v14 or higher)
- [npm](https://www.npmjs.com/) (Node package manager)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/meroitachi/flux1dev.git
    cd flux1dev
    ```

2. Install the required dependencies:

    ```bash
    npm install
    ```

## Running the Application

To start the server, run:

```bash
node index.js
```
The server will start on `http://localhost:3000`.

## API Endpoints

### 1. Submit Job for Image Generation
- **Endpoint**: `/submit`
- **Method**: `GET`
- **Query Parameters**:
  - `job`: The job ID of the prompt you want to generate an image for.
- **Response**:
  - On success: Returns the generated image as a `jpeg` response.
  - On failure: Returns a JSON error message with status code.

**Example**:

```bash
curl "http://localhost:3000/submit?job=j-1234567890"
```
### 2. Create a New Job

- **Endpoint**: `/job`
- **Method**: `GET`
- **Query Parameters**:
  - `prompt`: A text description to generate an image for.
- **Response**:
  - Returns a JSON object containing the job ID and a message about job expiration.

**Example**:

```bash
curl "http://localhost:3000/job?prompt=A%20BMW%20on%20a%20fairy%20tale%20street"
```
## Environment Variables

To use the Hugging Face API, ensure that your API keys are configured in the code:

```javascript
let hgKs = [
    "hf_BEWaECehgsWQfWMamzgXALuOEBBWjKGwS",
    "hf_yHRpThiULkaToJZZxMWWmuBDROmrqnXkp",
    "hf_TzyVejVsiTSaxQVLynLUgLEGsOtURyGar"
];
```
You can replace the API keys in the code with your own from Hugging Face.

## Future Improvements

- Add error-handling improvements for more robust API response validation.
- Support for saving generated images to local storage or cloud storage.
- Add more job management features (e.g., job cancellation).

## License

This project is licensed under the MIT License.
