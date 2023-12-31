import OpenAI from "openai";

/**
 * Hi – if you're reading this code and thinking "what the hell is this?", then
 * I'll put your mind at ease. It's a script that I use to summarize the work
 * that my team has done in a week. It's a bit of a hack, but it works.
 *
 * Feel free to open a pull request if you have any suggestions for improvements.
 */

const {
  PUBLIC_TRELLO_BOARD_ID = "",
  PUBLIC_TRELLO_API_KEY = "",
  PRIVATE_TRELLO_API_TOKEN = "",
  PRIVATE_OPEN_AI_API_KEY = "",
  BEGINNING_OF_NAME_OF_LIST_TO_SUMMARIZE = "",
  SUMMARY_HEADING = "",
  SUMMARY_LANGUAGE = "",
} = process.env;

const ENV_VARS = [
  "PUBLIC_TRELLO_BOARD_ID",
  "PUBLIC_TRELLO_API_KEY",
  "PRIVATE_TRELLO_API_TOKEN",
  "PRIVATE_OPEN_AI_API_KEY",
  "BEGINNING_OF_NAME_OF_LIST_TO_SUMMARIZE",
  "SUMMARY_HEADING",
  "SUMMARY_LANGUAGE",
];
for (let envVar in ENV_VARS) {
  if (!envVar) {
    console.error(`🚫 ${envVar} not set`);
    process.exit(-1);
  }
}

const listsResponse = await fetch(
  `https://api.trello.com/1/boards/${PUBLIC_TRELLO_BOARD_ID}/lists?key=${PUBLIC_TRELLO_API_KEY}&token=${PRIVATE_TRELLO_API_TOKEN}`
);
type ListJson = { id: string; name: string };
const lists: ListJson[] = await listsResponse.json();
const theList = lists.find((list) =>
  list.name
    .toLowerCase()
    .startsWith(BEGINNING_OF_NAME_OF_LIST_TO_SUMMARIZE.toLowerCase())
);

if (!theList) {
  console.error(
    `🚫 Could not find a list that started with "${BEGINNING_OF_NAME_OF_LIST_TO_SUMMARIZE}" in the given board`
  );
  process.exit(-1);
}

const cardsResponse = await fetch(
  `https://api.trello.com/1/lists/${theList.id}/cards?key=${PUBLIC_TRELLO_API_KEY}&token=${PRIVATE_TRELLO_API_TOKEN}`
);
type CardJson = { name: string; desc: string };
const cards: CardJson[] = await cardsResponse.json();

console.info(
  `💰 Found ${cards.length ?? "no"} card${
    cards.length === 1 ? "" : "s"
  } in the list "${theList?.name}".`
);

if (cards.length === 0) {
  console.warn("🤷 No cards in the list, therefore nothing to summarize.");
  process.exit(0);
}

const summarizableData = cards
  .map((card) => ({
    name: card.name,
    description: card.desc,
  }))
  .reduce((acc, card) => `${acc}\n\n${card.name}\n${card.description}`, ``);

const openai = new OpenAI({
  apiKey: PRIVATE_OPEN_AI_API_KEY,
});

const primer = `
Given a list of tasks and milestones from the week, write a short and precise Slack summary. Start the text with "${SUMMARY_HEADING}" in bold. If the text "${theList.name}" includes a number, append the week number to the heading.

Next, create a summary of everything that was done, with the headline "📜 TL;DR:" in bold. The summary should be a maximum of 300 characters.

Then list a summary of the most important tasks. Have a maximum of 7 points in the list, without numbers in front. Use a single relevant emoji before each summary. Each of the summaries should be one line and should only be one sentence long. Do not include links. Use a single newline to separate the points.

The tone should be professional, but with a positive twist.
Output the text in the language ${SUMMARY_LANGUAGE}, and double-check that all grammar is correct and that the text reads well.
Use a single * to mark bold text, not **.
Do not include anything after the list of points.`;

const prompt = `${primer}\n---\n${summarizableData}`;

console.info(
  "🤖 Querying OpenAI to summarize the content. This will take 10-30 seconds…"
);

const chatCompletion = await openai.chat.completions.create({
  messages: [{ role: "user", content: prompt }],
  model: "gpt-4",
});
console.info("✅ Summary ready!\n\n---\n");
console.info(chatCompletion.choices[0].message.content);
