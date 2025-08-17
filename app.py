from flask import Flask, request, render_template, session, redirect, url_for, jsonify
import pandas as pd
import wikipedia
import os
import requests
from fuzzywuzzy import fuzz
from textblob import TextBlob
import re
import spacy

# Load spaCy model for entity extraction
nlp = spacy.load("en_core_web_sm")

app = Flask(__name__)
app.secret_key = 'e77dbb4d184c953bf66c86df2d4ecd35'

DATA_FILE = os.path.join(os.path.dirname(__file__), 'Data.csv')

# ------------------------
# Save new Q&A to CSV
# ------------------------
def newData(question, answer):
    try:
        if not os.path.exists(DATA_FILE):
            df = pd.DataFrame(columns=["Question", "Answer"])
        else:
            df = pd.read_csv(DATA_FILE)

        new_entry = {"Question": question, "Answer": answer}
        df = pd.concat([df, pd.DataFrame([new_entry])], ignore_index=True)
        df.to_csv(DATA_FILE, index=False)
    except Exception as e:
        print(f"Error saving new data: {e}")

# ------------------------
# Sentiment Detection
# ------------------------
def detect_emotion(text):
    analysis = TextBlob(text)
    polarity = analysis.sentiment.polarity
    if polarity > 0.5:
        return "positive"
    elif polarity < -0.3:
        return "negative"
    elif -0.3 <= polarity <= 0.3:
        return "neutral"
    else:
        return "mixed"

# ------------------------
# Add empathy based on emotion
# ------------------------
def add_emotional_response(question, answer):
    emotion = detect_emotion(question)

    if emotion == "positive":
        return f"I'm glad to hear that! 😊<br><br>{answer}"
    elif emotion == "negative":
        return f"I'm sorry you're feeling that way. Let me try to help: 🤗<br><br>{answer}"
    elif emotion == "neutral":
        return f"{answer}"
    elif emotion == "mixed":
        return f"That’s an interesting perspective. Here's what I found: 🤔<br><br>{answer}"
    else:
        return answer

# ------------------------
# Detect comparison questions
# ------------------------
def is_comparison_question(question):
    comparison_keywords = ['compare', 'difference between', 'vs', 'versus', 'better than', 'faster than', 'more than', 'less than']
    return any(keyword in question.lower() for keyword in comparison_keywords)

# ------------------------
# Extract comparison items
# ------------------------
def extract_comparison_items(question):
    question = question.lower()

    # Case: "X vs Y"
    if " vs " in question:
        parts = question.split(" vs ")
        return parts[0].strip(), parts[1].strip()

    # Case: "difference between X and Y" or "compare X and Y"
    match = re.search(r"(?:compare|difference between)\s+(.*?)\s+(?:and|vs)\s+(.*)", question)
    if match:
        return match.group(1).strip(), match.group(2).strip()

    return None, None

# ------------------------
# Compare two items
# ------------------------
def compare_items(item1, item2):
    summary1 = find_from_wikipedia(item1) or find_from_duckduckgo(item1)
    summary2 = find_from_wikipedia(item2) or find_from_duckduckgo(item2)

    if summary1 and summary2:
        return f"<b>{item1.title()}:</b> {summary1}<br><br><b>{item2.title()}:</b> {summary2}"
    else:
        return fallback_to_google(f"{item1} vs {item2}")

# ------------------------
# Multi-turn context helpers
# ------------------------
def extract_main_entity(answer):
    """Extract the main named entity from an answer."""
    doc = nlp(answer)
    entities = [ent.text for ent in doc.ents]
    return entities[0] if entities else None

def resolve_pronouns(question, last_entity):
    """Replace pronouns with last known entity."""
    if not last_entity:
        return question

    pronouns = ["he", "she", "they", "it", "this", "that", "him", "her"]
    words = question.split()
    replaced = []
    for word in words:
        if word.lower() in pronouns:
            replaced.append(last_entity)
        else:
            replaced.append(word)
    return " ".join(replaced)

# ------------------------
# Main answer function
# ------------------------
def getAnswer(user_question):
    # Resolve pronouns using last entity in session
    if "last_entity" in session and session["last_entity"]:
        user_question = resolve_pronouns(user_question, session["last_entity"])

    # Clean question for emotional phrases
    clean_question = preprocess_question_based_on_emotion(user_question)

    # Handle comparison questions
    if is_comparison_question(clean_question):
        item1, item2 = extract_comparison_items(clean_question)
        if item1 and item2:
            raw_answer = compare_items(item1, item2)
            final_answer = add_emotional_response(user_question, raw_answer)

            # Save entity context
            entity = extract_main_entity(final_answer)
            if entity:
                session["last_entity"] = entity

            newData(user_question, final_answer)
            return final_answer

    # Search from local data
    if not os.path.exists(DATA_FILE):
        raw_answer = route_to_sources(clean_question)
        final_answer = add_emotional_response(user_question, raw_answer)

        # Save entity
        entity = extract_main_entity(final_answer)
        if entity:
            session["last_entity"] = entity

        return final_answer

    df = pd.read_csv(DATA_FILE)
    best_match = None
    best_score = 0

    for _, row in df.iterrows():
        score = fuzz.token_set_ratio(clean_question.lower(), str(row['Question']).lower())
        if score > best_score:
            best_score = score
            best_match = row['Answer']

    if best_score > 85:
        raw_answer = best_match
    else:
        raw_answer = route_to_sources(clean_question)

    final_answer = add_emotional_response(user_question, raw_answer)

    # Save entity for context
    entity = extract_main_entity(final_answer)
    if entity:
        session["last_entity"] = entity

    newData(user_question, final_answer)
    return final_answer


def preprocess_question_based_on_emotion(original_question):
    emotion = detect_emotion(original_question)

    cleaned_question = original_question.lower()

    emotional_prefixes = [
        "i'm frustrated with", "i hate", "i love", "i'm confused about",
        "i'm tired of", "i'm annoyed with", "i'm struggling with", "i like",
        "i'm so happy about", "i feel like", "i can't figure out"
    ]

    for phrase in emotional_prefixes:
        if phrase in cleaned_question:
            cleaned_question = cleaned_question.replace(phrase, "")

    cleaned_question = cleaned_question.strip("?!. ")
    return cleaned_question

# ------------------------
# Wikipedia summary
# ------------------------
def find_from_wikipedia(topic):
    try:
        search_results = wikipedia.search(topic)
        if search_results:
            return "According to Wikipedia, " + wikipedia.summary(search_results[0], sentences=2)
    except Exception as e:
        print(f"Wikipedia error: {e}")
    return None

# ------------------------
# DuckDuckGo API
# ------------------------
def find_from_duckduckgo(query):
    try:
        url = "https://api.duckduckgo.com/"
        params = {
            "q": query,
            "format": "json",
            "no_html": 1,
            "skip_disambig": 1
        }
        response = requests.get(url, params=params)
        data = response.json()

        if data.get("Abstract"):
            return data["Abstract"]

        related = data.get("RelatedTopics")
        if related and isinstance(related, list):
            for item in related:
                if isinstance(item, dict) and 'Text' in item:
                    return item['Text']
    except Exception as e:
        print("DuckDuckGo error:", e)
    return None

# ------------------------
# Fallback to Google
# ------------------------
def fallback_to_google(topic):
    return f"Sorry, I couldn't find an answer. Try searching on <a href='https://www.google.com/search?q={topic}' target='_blank'>Google</a>."

# ------------------------
# Fallback routing
# ------------------------
def route_to_sources(question):
    ddg = find_from_duckduckgo(question)
    if ddg:
        return ddg

    wiki = find_from_wikipedia(question)
    if wiki:
        return wiki

    return fallback_to_google(question)

# ------------------------
# Flask Routes
# ------------------------
@app.route("/", methods=["GET", "POST"])
def index():
    if 'history' not in session:
        session['history'] = []
    if 'last_entity' not in session:
        session['last_entity'] = None

    if request.method == "POST":
        question = request.form.get("query")
        if question:
            answer = getAnswer(question)
            session['history'].append({"question": question, "answer": answer})
            session.modified = True

            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({"question": question, "answer": answer})

    return render_template("template.html", history=session.get('history', []))

@app.route("/reset", methods=["POST"])
def reset():
    session.pop('history', None)
    session.pop('last_entity', None)
    return redirect(url_for('index'))

# ------------------------
# Run the App
# ------------------------
if __name__ == "__main__":
    app.run(debug=True)
