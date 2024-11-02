# Cursor Lens ✨

Cursor Lens is an open-source tool designed to provide insights into AI-assisted coding sessions using Cursor AI. It acts as a proxy between Cursor and various AI providers, logging interactions and providing detailed analytics to help developers optimize their use of AI in their coding workflow.

We are live on ProductHunt today, please upvote us if you find this useful! 🙏

<a href="https://www.producthunt.com/posts/cursor-lens?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-cursor&#0045;lens" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=480850&theme=neutral" alt="Cursor&#0032;Lens - Open&#0032;Source&#0032;Dashboard&#0032;and&#0032;Analytics&#0032;for&#0032;Cursor&#0032;IDE | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

![Cursor Lens Dashboard](public/cl-dashboard.png)

## Features

- **AI Provider Integration**: Supports multiple AI providers including OpenAI, Anthropic, and more.
- **Request Logging**: Captures and logs all requests between Cursor and AI providers.
- **Analytics Dashboard**: Provides visual analytics on AI usage, including token consumption and request patterns.
- **Configurable AI Models**: Allows users to set up and switch between different AI configurations.
- **Real-time Monitoring**: Offers a live view of ongoing AI interactions.
- **Token Usage Tracking**: Monitors and reports on token usage across different models.
- **Cost Estimation**: Provides estimated costs based on token usage and model pricing.

## Technology Stack

- **Frontend/Backend**: Next.js with React
- **Database**: PostgreSQL with Prisma ORM
- **AI Library**: Vercel AI SDK
- **Styling**: Tailwind CSS with shadcn/ui components

## Getting Started

For detailed installation instructions, please refer to our [Installation Guide](https://www.cursorlens.com/docs/getting-started/installation).

### Prerequisites

- Node.js (v14 or later)
- pnpm
- PostgreSQL
- Docker and Docker Compose (optional)

### Option 1: Running with Docker

1. Clone the repository:

```bash
git clone https://github.com/yourusername/cursor-lens.git
cd cursor-lens
```

2. Create a `.env` file:

```bash
cp .env.example .env
```

3. Configure your `.env` file with required values:

```plaintext
# Required
DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres
NGROK_AUTHTOKEN=your_ngrok_auth_token_here

# At least one AI provider key is required
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
# ... other optional provider keys
```

4. Start the services:

```bash
docker compose up -d
```

This will start:

- PostgreSQL database
- CursorLens application
- Ngrok tunnel (automatically configured)

5. Access the dashboard:

- Open `http://localhost:3000` for the dashboard
- View tunnel status at `http://localhost:4040`
- Use the tunnel URL displayed in the dashboard for Cursor configuration

Note: The ngrok tunnel URL will be automatically displayed in the dashboard's connection section. Use this URL in Cursor's OpenAI Base URL setting.

### Option 2: Running Locally

1. Clone the repository and install dependencies

```bash
git clone https://github.com/yourusername/cursor-lens.git
cd cursor-lens
pnpm install
```

2. Copy the example environment file and configure it

```bash
cp .env.example .env
```

3. Set up the database

```bash
pnpm prisma migrate dev
pnpm prisma db seed
```

4. Start the development server

```bash
pnpm dev
```

### Configuration

1. Configure your `.env` file:

```plaintext
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres

# AI Provider Keys (at least one is required)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Tunnel Configuration
NGROK_AUTHTOKEN=your_ngrok_auth_token_here  # Required for ngrok tunneling
```

2. Set up tunneling:
   - The dashboard now includes built-in ngrok tunnel management
   - Your tunnel URL will be displayed in the dashboard
   - Use this URL in Cursor's OpenAI Base URL setting

## Usage

1. Configure Cursor to use Cursor Lens as its API endpoint by overriding `OpenAI Base URL`.
2. Choose a `gpt-` model. Use Cursor as normal for AI-assisted coding.
3. Visit the Cursor Lens dashboard to view logs, statistics, and insights.

![Cursor settings](public/cl-settings.png)

## Stats page

![Cursor Lens Stats](public/cl-stats.jpeg)

## Prompt caching with Anthropic (v0.1.2):

1. Create a new config on `/configuration` page, choose `antropicCached` with Sonnet 3.5. Name it as you like.
2. Mark it as default.
3. Use Cursor with CursorLens as normal. The system and context messages in `CMD+L` and `CMD+i` chats will be cached from now on.

> Note that TTL for the cache is 5 minutes.

![Add a new config with Antropic Cached](public/anthropicCashedXConfig.png)
![Example Cache creation response](public/ant-cache-create.png)
![Example Cache read response](public/ant-cache-read.png)

# Releases

## [0.2.0] - 2024-11-03

### Added

- Integrated ngrok tunnel management directly in the dashboard
- Improved cost calculation system with better error handling
- Combined seed and cost update scripts for easier maintenance
- Detailed logging for cost updates and seeding operations

### Changed

- Simplified database seeding process
- Better error handling for edge cases in cost calculations
- More detailed console output during seeding operations
- Improved tunnel management UI

### Coming Soon

- Cloudflare tunnel support as an alternative to ngrok

### How to Update

1. Update your environment variables:
   ```bash
   # Add to your .env file:
   NGROK_AUTHTOKEN=your_ngrok_auth_token_here
   ```
2. Run the database updates:
   ```bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

## [0.2.0] - 2024-11-02

### Added

- Improved cost calculation system with better error handling
- Integrated ngrok tunnel management directly in the dashboard
- Combined seed and cost update scripts for easier maintenance
- Detailed logging for cost updates and seeding operations

### Changed

- Simplified database seeding process - now one command handles both model costs and log updates
- Better error handling for edge cases in cost calculations
- More detailed console output during seeding operations
- Improved secure handling of API keys that are mentioned in the headers. The `seed` script also removes it from previous logs.

### How to Update

1. Update your environment variables:

```bash
# Add to your .env file:
NGROK_AUTHTOKEN=your_ngrok_auth_token_here
```

2. Run the database updates:

```bash
pnpm prisma migrate dev
pnpm prisma db seed
```

## [0.1.2-alpha] - 2024-08-22

### Added

- Add Anthropic Cache support for context messages
- Increase Token limit for Anthropic to 8192 tokens
- Improved statistics page: Now you can select the data points you want to see

### Improved and fixed

- Log details are now collapsible
- Full response is captured in the logs

## [0.1.1-alpha] - 2024-08-18

### ⚠️ ALPHA RELEASE

### Added

- Added support for Mistral AI, Cohere, Groq, and Ollama

## [0.1.0-alpha] - 2024-08-17

This is the initial alpha release of CursorLens. As an alpha version, it may contain bugs and is not yet feature-complete. Use with caution in non-production environments.

### Added

- Initial project setup with Next.js
- Basic proxy functionality between Cursor and AI providers (OpenAI, Anthropic)
- Simple dashboard for viewing AI interaction logs
- Token usage tracking for OpenAI and Anthropic models
- Basic cost estimation based on token usage
- Support for PostgreSQL database with Prisma ORM
- Environment variable configuration for API keys and database connection
- Basic error handling and logging

### Known Issues

- Limited error handling for edge cases
- Incomplete test coverage
- Basic UI with limited customization options
- Potential performance issues with large volumes of requests
- Cost calculation for cached messages in Anthropic are not correct

## Contributing

We welcome contributions to Cursor Lens! Please see our [Contributing Guide](CONTRIBUTING.md) for more details on how to get started.

## License

Cursor Lens is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository or contact the maintainers directly.

For more detailed information, please visit our [documentation](https://www.cursorlens.com/docs/project/introduction).

---

Happy coding with Cursor Lens!

```

```
