const quoteText = document.getElementById("quote");
const authorText = document.getElementById("author");
const newQuoteBtn = document.getElementById("new-quote");
const speakBtn = document.getElementById("speak");
const copyBtn = document.getElementById("copy");

// --- 50 Quotes (offline-safe) ---
const quotes = [
  {"content": "Believe in yourself and all that you are.", "author": "Christian D. Larson"},
  {"content": "Dream big. Start small. Act now.", "author": "Robin Sharma"},
  {"content": "Action is the foundational key to all success.", "author": "Pablo Picasso"},
  {"content": "The future depends on what you do today.", "author": "Mahatma Gandhi"},
  {"content": "Success is not final, failure is not fatal: it is the courage to continue that counts.", "author": "Winston Churchill"},
  {"content": "Don’t watch the clock; do what it does. Keep going.", "author": "Sam Levenson"},
  {"content": "Hardships often prepare ordinary people for an extraordinary destiny.", "author": "C.S. Lewis"},
  {"content": "Start where you are. Use what you have. Do what you can.", "author": "Arthur Ashe"},
  {"content": "You miss 100% of the shots you don’t take.", "author": "Wayne Gretzky"},
  {"content": "Great things never come from comfort zones.", "author": "Roy T. Bennett"},
  {"content": "Push yourself, because no one else is going to do it for you.", "author": "Unknown"},
  {"content": "Don’t stop when you’re tired. Stop when you’re done.", "author": "Marilyn Monroe"},
  {"content": "It always seems impossible until it’s done.", "author": "Nelson Mandela"},
  {"content": "Wake up with determination. Go to bed with satisfaction.", "author": "George Lorimer"},
  {"content": "Don’t limit your challenges. Challenge your limits.", "author": "Jerry Dunn"},
  {"content": "The way to get started is to quit talking and begin doing.", "author": "Walt Disney"},
  {"content": "Opportunities don’t happen. You create them.", "author": "Chris Grosser"},
  {"content": "Do something today that your future self will thank you for.", "author": "Sean Patrick Flanery"},
  {"content": "Sometimes later becomes never. Do it now.", "author": "Unknown"},
  {"content": "Work hard in silence, let your success make the noise.", "author": "Frank Ocean"},
  {"content": "Discipline is the bridge between goals and accomplishment.", "author": "Jim Rohn"},
  {"content": "If you get tired, learn to rest, not to quit.", "author": "Banksy"},
  {"content": "It’s not whether you get knocked down, it’s whether you get up.", "author": "Vince Lombardi"},
  {"content": "Strive not to be a success, but rather to be of value.", "author": "Albert Einstein"},
  {"content": "Do one thing every day that scares you.", "author": "Eleanor Roosevelt"},
  {"content": "Everything you’ve ever wanted is on the other side of fear.", "author": "George Addair"},
  {"content": "Try not to become a person of success, but rather a person of value.", "author": "Albert Einstein"},
  {"content": "The secret of getting ahead is getting started.", "author": "Mark Twain"},
  {"content": "Go the extra mile. It’s never crowded there.", "author": "Wayne Dyer"},
  {"content": "Don’t count the days, make the days count.", "author": "Muhammad Ali"},
  {"content": "What defines us is how well we rise after falling.", "author": "Lionel from Maid in Manhattan"},
  {"content": "You don’t have to be great to start, but you have to start to be great.", "author": "Zig Ziglar"},
  {"content": "If you can dream it, you can do it.", "author": "Walt Disney"},
  {"content": "It’s never too late to be what you might have been.", "author": "George Eliot"},
  {"content": "Doubt kills more dreams than failure ever will.", "author": "Suzy Kassem"},
  {"content": "In the middle of every difficulty lies opportunity.", "author": "Albert Einstein"},
  {"content": "Don’t let yesterday take up too much of today.", "author": "Will Rogers"},
  {"content": "Perseverance is not a long race; it is many short races one after another.", "author": "Walter Elliot"},
  {"content": "A river cuts through rock not because of its power, but because of its persistence.", "author": "Jim Watkins"},
  {"content": "Your limitation—it’s only your imagination.", "author": "Unknown"},
  {"content": "Sometimes we’re tested not to show our weaknesses, but to discover our strengths.", "author": "Unknown"},
  {"content": "Be stronger than your excuses.", "author": "Unknown"},
  {"content": "If you want something you never had, you have to do something you’ve never done.", "author": "Thomas Jefferson"},
  {"content": "Don’t be afraid to fail. Be afraid not to try.", "author": "Michael Jordan"},
  {"content": "Success is walking from failure to failure with no loss of enthusiasm.", "author": "Winston Churchill"},
  {"content": "Act as if what you do makes a difference. It does.", "author": "William James"},
  {"content": "Believe you can and you're halfway there.", "author": "Theodore Roosevelt"},
  {"content": "Hustle in silence and let your success make the noise.", "author": "Unknown"},
  {"content": "Big journeys begin with small steps.", "author": "Unknown"},
  {"content": "Do what you can, with what you have, where you are.", "author": "Theodore Roosevelt"}
];

// --- Functions ---
function getQuote() {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteText.textContent = `"${randomQuote.content}"`;
  authorText.textContent = `- ${randomQuote.author}`;
  showQuote();
}

function showQuote() {
  const box = document.querySelector(".quote-box");
  box.classList.remove("show");
  setTimeout(() => box.classList.add("show"), 100);
}

function speakQuote() {
  const utterance = new SpeechSynthesisUtterance(`${quoteText.textContent} by ${authorText.textContent}`);
  speechSynthesis.speak(utterance);
}

function copyQuote() {
  const text = `${quoteText.textContent} ${authorText.textContent}`;
  navigator.clipboard.writeText(text);
  copyBtn.textContent = "✅ Copied!";
  setTimeout(() => (copyBtn.textContent = "📋 Copy"), 1500);
}

// --- Event Listeners ---
newQuoteBtn.addEventListener("click", getQuote);
speakBtn.addEventListener("click", speakQuote);
copyBtn.addEventListener("click", copyQuote);

// --- Default Message ---
quoteText.textContent = "Click below to get inspired!";
authorText.textContent = "- Unknown";
