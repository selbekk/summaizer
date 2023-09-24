import OpenAI from "openai";

/**
 * Hi – if you're reading this code and thinking "what the hell is this?", then
 * I'll put your mind at ease. It's a script that I use to summarize the work
 * that my team has done in a week. It's a bit of a hack, but it works.
 *
 * Feel free to open a pull request if you have any suggestions for improvements.
 */

const PUBLIC_TRELLO_BOARD_ID = process.env.PUBLIC_TRELLO_BOARD_ID;
const PUBLIC_TRELLO_API_KEY = process.env.PUBLIC_TRELLO_API_KEY;
const PRIVATE_TRELLO_API_TOKEN = process.env.PRIVATE_TRELLO_API_TOKEN;
const PRIVATE_OPEN_AI_API_KEY = process.env.PRIVATE_OPEN_AI_API_KEY;
const BEGINNING_OF_NAME_OF_LIST_TO_SUMMARIZE =
  process.env.BEGINNING_OF_NAME_OF_LIST_TO_SUMMARIZE;

if (!PUBLIC_TRELLO_BOARD_ID) {
  console.error("PUBLIC_TRELLO_BOARD_ID not set");
  process.exit(-1);
}
if (!PUBLIC_TRELLO_API_KEY) {
  console.error("PUBLIC_TRELLO_API_KEY not set");
  process.exit(-1);
}
if (!PRIVATE_TRELLO_API_TOKEN) {
  console.error("PRIVATE_TRELLO_API_TOKEN not set");
  process.exit(-1);
}
if (!PRIVATE_OPEN_AI_API_KEY) {
  console.error("PRIVATE_OPEN_AI_API_KEY not set");
  process.exit(-1);
}
if (!BEGINNING_OF_NAME_OF_LIST_TO_SUMMARIZE) {
  console.error("BEGINNING_OF_NAME_OF_LIST_TO_SUMMARIZE not set");
  process.exit(-1);
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
    `Fant ikke en liste som startet på "${BEGINNING_OF_NAME_OF_LIST_TO_SUMMARIZE}" i det angitte boardet`
  );
  process.exit(-1);
}

const cardsResponse = await fetch(
  `https://api.trello.com/1/lists/${theList.id}/cards?key=${PUBLIC_TRELLO_API_KEY}&token=${PRIVATE_TRELLO_API_TOKEN}`
);
type CardJson = { name: string; desc: string };
const cards: CardJson[] = await cardsResponse.json();

console.info(`Fant ${cards.length ?? "ingen"} kort i listen ${theList?.name}.`);

if (cards.length === 0) {
  console.warn("Ingen kort i listen, og derfor ingenting å oppsummere");
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
Gitt en liste med oppgaver og milepæler fra uken, skriv en kort og presis 
Slack-oppsummering. Start teksten med "Team insane, uke 38 :team-insane-icon:" i fet skrift. 

Dernest lag en oppsummering av alt som ble gjort, med overskriften "📜 TL;DR:" i fet skrift.
Oppsummeringen skal være på maks 300 tegn.
Dernest list opp en oppsummering av de viktigste oppgavene. Ha maks 7 punkter i listen, uten tall foran.
Bruk relevante emojis foran hver oppsummering.
Hver av oppsummeringene skal være på én linje, og skal kun være én setning lang.
Ikke inkluder lenker.
Tonen skal være profesjonell, men med en positiv vri.
Skriv på norsk (bokmål), og dobbeltsjekk at alt av grammatikk er riktig.
Bruk enkelt-stjerne for å markere fet skrift.

Ikke avslutt teksten med oppsummeringer.`;

const prompt = `${primer}\n\n${summarizableData}`;

console.info("🤖 Spør OpenAI om å oppsummere. Dette kan ta noen sekunder…");

const chatCompletion = await openai.chat.completions.create({
  messages: [{ role: "user", content: prompt }],
  model: "gpt-4",
});
console.info("\n\n");
console.info(chatCompletion.choices[0].message.content);
