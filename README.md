# summaizer

Don't you just hate spending the last couple of minutes of your Friday to summarize the work you've done this week? Well, I do. So I made this script to do it for me.

This script summarizes the contents of a "done" list of tasks in a given Trello board, with Open AI.

## How to use

To use this script, clone it, and create a `.env` file with the following contents:

```bash
PUBLIC_TRELLO_BOARD_ID="your trello board id"
PUBLIC_TRELLO_API_KEY="your public trello api key"
PRIVATE_TRELLO_API_TOKEN="your private trello api token"
PRIVATE_OPEN_AI_API_KEY="your private open ai api key"
BEGINNING_OF_NAME_OF_LIST_TO_SUMMARIZE="the (beginning of the) name of the list you want summarized"
SUMMARY_HEADING="the heading of the summary"
SUMMARY_LANGUAGE="the language of the summary (e.g. en-US, nb-NO, Norwegian Bokmål)"
```

You can also run this command to create the `.env` file with some sample content:

```bash
cp .env.example .env
```

- To get the board ID of your board, look at your trello board URL.
- To get your Trello API key and token, follow [this guide](https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/#managing-your-api-key).
- To get your Open AI API key, register for a paid subscription, and then visit [this page](https://platform.openai.com/account/api-keys).

Next, you need to make sure you have bun installed. You can read up on how [here](https://bun.sh/), or just trust me and run this:

```bash
curl -fsSL https://bun.sh/install | bash
```

Next, install dependencies.

```bash
bun install
```

Finally, run the script with

```bash
bun start
```

## It doesn't fit my format

That's fine – just change the `primer` in the `index.ts` file to fit your needs.

## Questions?

Do you love it? Hate it? Have some suggestions to improve it? Let me know in either the issues or on [x/twitter](https://x.com/selbekk).
