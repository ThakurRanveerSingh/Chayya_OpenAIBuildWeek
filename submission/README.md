# Project Name

> Replace this line with a one-sentence description of your project.

## Overview

Describe the problem your project solves, who it serves, and the main user outcome. Include the key features a judge should try first.

## Demo

- Live app or test link: `https://replace-with-your-demo-url`
- Demo video: `https://youtube.com/replace-with-your-video-url`

## Prerequisites

List everything a reviewer needs before running the project. For example:

- Node.js 20 or later
- npm 10 or later
- An API key for any third-party service used by the app

## Setup

1. Clone the repository.

   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd <YOUR_PROJECT_DIRECTORY>
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create a local environment file and add the required values. Do not commit secrets.

   ```bash
   cp .env.example .env
   ```

4. Update `.env` with the required credentials and configuration. Document every variable here:

   ```text
   OPENAI_API_KEY=your_api_key
   # Add other variables required by this project.
   ```

## Run locally

Start the project with:

```bash
npm run dev
```

Open the local URL printed in the terminal, then try this suggested judge flow:

1. [Describe the first action.]
2. [Describe the expected result.]
3. [Describe the feature that demonstrates the project’s core value.]

Replace these commands and steps if your project uses a different stack or run procedure.

## Testing

Run the automated checks with:

```bash
npm test
```

Add any manual testing notes, seed data, test credentials, or platform limitations needed for judging.

## How GPT-5.6 and Codex were used

This project was built with Codex using GPT-5.6 as a collaborative development partner. Codex helped translate the product idea into an implementation plan, generate and refine application code, troubleshoot issues, and improve the project documentation.

Throughout development, GPT-5.6 and Codex accelerated iteration by helping evaluate implementation options, identify edge cases, and turn feedback into focused changes. The final project was reviewed and tested by the project team; Codex was used to speed up the build process while the team made the product, engineering, and design decisions.

Before submission, replace or expand this section with specific examples from your project, such as the features Codex helped implement, important technical decisions, debugging sessions, and improvements made after testing.

## Repository access for judges

If this repository is private, grant access to:

- `testing@devpost.com`
- `build-week-event@openai.com`

## License

Add your project license here.
