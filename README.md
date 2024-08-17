# Cursor Lens ✨

Cursor Lens is an open-source tool designed to provide insights into AI-assisted coding sessions using Cursor AI. It acts as a proxy between Cursor and various AI providers, logging interactions and providing detailed analytics to help developers optimize their use of AI in their coding workflow.

## Features

- **AI Provider Integration**: Supports multiple AI providers including OpenAI, Anthropic, and more.
- **Request Logging**: Captures and logs all requests between Cursor and AI providers.
- **Analytics Dashboard**: Provides visual analytics on AI usage, including token consumption and request patterns.
- **Configurable AI Models**: Allows users to set up and switch between different AI configurations.
- **Real-time Monitoring**: Offers a live view of ongoing AI interactions.
- **Token Usage Tracking**: Monitors and reports on token usage across different models.
- **Cost Estimation**: Provides estimated costs based on token usage and model pricing.

## Technology Stack

- **Frontend**: Next.js with React
- **Backend**: Node.js with FastAPI
- **Database**: PostgreSQL with Prisma ORM
- **Analytics**: Recharts for data visualization
- **Styling**: Tailwind CSS with shadcn/ui components

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- pnpm
- PostgreSQL

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/HamedMP/CursorLens.git
   cd CursorLens
   ```

2. Install dependencies:

   ```
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/cursorlens"
   OPENAI_API_KEY="your_openai_api_key"
   ANTHROPIC_API_KEY="your_anthropic_api_key"
   ```

4. Set up the database:

   ```
   pnpm prisma migrate dev
   ```

5. Build the project:
   ```
   pnpm build
   ```

### Running the Application

1. Start the development server:

   ```
   pnpm dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Configure Cursor to use Cursor Lens as its API endpoint.
2. Use Cursor as normal for AI-assisted coding.
3. Visit the Cursor Lens dashboard to view logs, statistics, and insights.

## Contributing

We welcome contributions to Cursor Lens! Please see our [Contributing Guide](CONTRIBUTING.md) for more details on how to get started.

## License

Cursor Lens is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See the [LICENSE](LICENSE) file for details.

This means that if you modify Cursor Lens and use it as part of a hosted service, you must make your modified version available under the AGPL-3.0 license.

## Acknowledgments

- The Cursor.sh team for their innovative AI-assisted coding tool
- OpenAI, Anthropic, and other AI providers for their powerful language models
- The open-source community for their invaluable contributions

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository or contact the maintainers directly.

---

Happy coding with Cursor Lens!
